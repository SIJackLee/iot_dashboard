// GET /api/farms/summary

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst, toKstIso, diffSec } from "@/lib/timeKst";
import { getFarmOfflineThSec } from "@/lib/offlineProfile";
import { calculateState } from "@/lib/stateRules";
import type {
  FarmsSummaryResponseDTO,
  FarmSummaryDTO,
} from "@/types/dto";

const SUMMARY_CACHE_TTL_MS = 10000;
let summaryCache: { data: FarmsSummaryResponseDTO; expiresAt: number } | null =
  null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const nowMs = Date.now();
    if (summaryCache && summaryCache.expiresAt > nowMs) {
      const cachedData = summaryCache.data;
      // limit이 지정된 경우 캐시된 데이터에서 슬라이스
      if (limit !== undefined && limit > 0) {
        return NextResponse.json(
          {
            ...cachedData,
            items: cachedData.items.slice(0, limit),
            totalCount: cachedData.totalCount, // 전체 개수는 그대로 반환
          },
          {
            headers: {
              "Cache-Control": "public, max-age=10, stale-while-revalidate=10",
            },
          }
        );
      }
      return NextResponse.json(cachedData, {
        headers: {
          "Cache-Control": "public, max-age=10, stale-while-revalidate=10",
        },
      });
    }

    // chunkArray 유틸리티 함수
    const chunkArray = <T,>(arr: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    // limit이 있을 때: 필요한 농장만 조회
    // limit이 없을 때: 전체 조회
    const fetchMappings = async (farmLimit?: number) => {
      const all: {
        key12: string;
        isind_regist_no: string;
        stall_no: number;
        room_no: number;
        vent_mode: string;
        blower_count: number;
        vent_count: number;
      }[] = [];

      if (farmLimit !== undefined && farmLimit > 0) {
        // limit이 있을 때: 먼저 농장 목록을 가져온 후, 해당 농장들의 mapping만 조회
        // 전체 조회 후 중복 제거 (Supabase DISTINCT는 복잡하므로 클라이언트 측 처리)
        const allFarms = await supabaseSelect<{ isind_regist_no: string }>(
          "eqpmn_mapping_set_v3",
          {
            select: "isind_regist_no",
            order: "isind_regist_no",
          }
        );
        
        // 중복 제거 및 limit 적용
        const uniqueFarms = Array.from(
          new Set(allFarms.map((f) => f.isind_regist_no))
        ).slice(0, farmLimit);

        if (uniqueFarms.length === 0) {
          return all;
        }

        // 해당 농장들의 mapping만 조회 (병렬 처리)
        const farmChunks = chunkArray(uniqueFarms, 100); // Supabase IN 절 제한 고려
        const parallelLimit = 3; // 동시 실행 제한
        for (let i = 0; i < farmChunks.length; i += parallelLimit) {
          const batch = farmChunks.slice(i, i + parallelLimit);
          const results = await Promise.all(
            batch.map((farmChunk) =>
              supabaseSelect<typeof all[number]>(
                "eqpmn_mapping_set_v3",
                {
                  select:
                    "key12,isind_regist_no,stall_no,room_no,vent_mode,blower_count,vent_count",
                  in: { isind_regist_no: farmChunk },
                  order: "key12",
                }
              )
            )
          );
          all.push(...results.flat());
        }
      } else {
        // limit이 없을 때: 전체 조회 (기존 로직)
        const pageLimit = 1000;
        let offset = 0;
        while (true) {
          const page = await supabaseSelect<typeof all[number]>(
            "eqpmn_mapping_set_v3",
            {
              select:
                "key12,isind_regist_no,stall_no,room_no,vent_mode,blower_count,vent_count",
              order: "key12",
              limit: pageLimit,
              offset,
            }
          );
          all.push(...page);
          if (page.length < pageLimit) break;
          offset += pageLimit;
        }
      }
      return all;
    };

    // 전체 농장 수 계산 (limit과 무관)
    const getAllFarmCount = async (): Promise<number> => {
      const allFarms = await supabaseSelect<{ isind_regist_no: string }>(
        "eqpmn_mapping_set_v3",
        {
          select: "isind_regist_no",
          order: "isind_regist_no",
        }
      );
      const uniqueFarms = Array.from(
        new Set(allFarms.map((f) => f.isind_regist_no))
      );
      return uniqueFarms.length;
    };

    // mapping rows 조회 (limit 적용)
    const mappingRows = await fetchMappings(limit);
    
    // 전체 농장 수 계산 (병렬로 처리하여 성능 최적화)
    const totalCountPromise = getAllFarmCount();

    if (mappingRows.length === 0) {
      const totalCount = await totalCountPromise;
      return NextResponse.json({
        serverNowKst: serverNowKst(),
        items: [],
        totalCount,
      } as FarmsSummaryResponseDTO);
    }

    const key12List = mappingRows.map((m) => m.key12);

    // snapshots 조회 (key12 in 길이 제한 대비) - 병렬 처리
    const snapshotRows: {
      key12: string;
      updated_at: string;
      es01: number[];
      es02: number[];
      es03: number[];
      es04: number[];
      es09: number[];
    }[] = [];
    const chunks = chunkArray(key12List, 500);
    
    // 병렬로 쿼리 실행 (최대 5개 동시 실행)
    const parallelLimit = 5;
    for (let i = 0; i < chunks.length; i += parallelLimit) {
      const batch = chunks.slice(i, i + parallelLimit);
      const results = await Promise.all(
        batch.map((chunk) =>
          supabaseSelect<typeof snapshotRows[number]>(
            "room_raw_snapshot_v3",
            {
              select: "key12,updated_at,es01,es02,es03,es04,es09",
              in: { key12: chunk },
            }
          )
        )
      );
      snapshotRows.push(...results.flat());
    }

    // farm별로 그룹화
    const farmMap = new Map<string, typeof mappingRows>();
    for (const mapping of mappingRows) {
      const registNo = mapping.isind_regist_no;
      if (!farmMap.has(registNo)) {
        farmMap.set(registNo, []);
      }
      farmMap.get(registNo)!.push(mapping);
    }

    const now = new Date();
    const nowKst = serverNowKst();

    // farm별 summary 계산
    // getFarmOfflineThSec는 기본값(211초)을 먼저 사용하고, 
    // 캐시가 있으면 사용하되, 캐시 미스 시에는 기본값으로 빠르게 처리
    // (실제 계산은 백그라운드에서 수행되도록 캐시에 저장)
    const items: FarmSummaryDTO[] = [];
    const registNos = Array.from(farmMap.keys());
    
    // 모든 농장의 offlineThSec를 병렬로 가져오기 (기본값 우선 사용)
    const offlineThSecMap = new Map<string, number>();
    
    // 병렬로 처리하되, 최대 10개씩 배치 처리
    const batchSize = 10;
    for (let i = 0; i < registNos.length; i += batchSize) {
      const batch = registNos.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(async (registNo) => {
          try {
            const thSec = await getFarmOfflineThSec(registNo);
            return { registNo, thSec };
          } catch (error) {
            // 에러 시 기본값 사용
            return { registNo, thSec: 211 };
          }
        })
      );
      
      // 결과 처리
      for (let idx = 0; idx < results.length; idx++) {
        const result = results[idx];
        const registNo = batch[idx];
        if (result.status === "fulfilled") {
          offlineThSecMap.set(result.value.registNo, result.value.thSec);
        } else {
          // 실패한 경우 기본값 사용
          offlineThSecMap.set(registNo, 211);
        }
      }
    }

    for (const [registNo, mappings] of farmMap.entries()) {
      const offlineThSec = offlineThSecMap.get(registNo) || 211; // 기본값 211초

      let normal = 0;
      let warn = 0;
      let danger = 0;
      let offline = 0;
      let lastUpdatedAt: Date | null = null;

      for (const mapping of mappings) {
        const snapshot = snapshotRows.find((s) => s.key12 === mapping.key12);

        if (!snapshot) {
          offline++;
          continue;
        }

        const updatedAt = new Date(snapshot.updated_at);
        if (!lastUpdatedAt || updatedAt > lastUpdatedAt) {
          lastUpdatedAt = updatedAt;
        }

        const freshnessSec = diffSec(now, snapshot.updated_at);

        const state = calculateState(
          {
            es01: snapshot.es01 || [],
            es02: snapshot.es02 || [],
            es03: snapshot.es03 || [],
            es04: snapshot.es04 || [],
            es09: snapshot.es09 || [],
          },
          offlineThSec,
          freshnessSec
        );

        if (state === "normal") normal++;
        else if (state === "warn") warn++;
        else if (state === "danger") danger++;
        else if (state === "offline") offline++;
      }

      const freshnessSec = lastUpdatedAt
        ? diffSec(now, lastUpdatedAt)
        : null;

      items.push({
        registNo,
        totalRooms: mappings.length,
        normal,
        warn,
        danger,
        offline,
        lastUpdatedAtKst: lastUpdatedAt ? toKstIso(lastUpdatedAt) : null,
        freshnessSec,
      });
    }

    // 전체 농장 수 가져오기
    const totalCount = await totalCountPromise;
    
    const responseData: FarmsSummaryResponseDTO = {
      serverNowKst: nowKst,
      items,
      totalCount,
    };
    summaryCache = {
      data: responseData,
      expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
    };
    
    // limit이 지정된 경우 해당 개수만 반환
    const finalItems = limit !== undefined && limit > 0 
      ? items.slice(0, limit)
      : items;
    
    return NextResponse.json(
      {
        ...responseData,
        items: finalItems,
        totalCount, // limit과 무관하게 전체 개수 반환
      },
      {
        headers: {
          "Cache-Control": "public, max-age=10, stale-while-revalidate=10",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
