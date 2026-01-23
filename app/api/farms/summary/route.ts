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

export async function GET() {
  try {
    const nowMs = Date.now();
    if (summaryCache && summaryCache.expiresAt > nowMs) {
      return NextResponse.json(summaryCache.data, {
        headers: {
          "Cache-Control": "public, max-age=10, stale-while-revalidate=10",
        },
      });
    }

    const fetchAllMappings = async () => {
      const all: {
        key12: string;
        isind_regist_no: string;
        stall_no: number;
        room_no: number;
        vent_mode: string;
        blower_count: number;
        vent_count: number;
      }[] = [];
      const limit = 1000;
      let offset = 0;
      while (true) {
        const page = await supabaseSelect<typeof all[number]>(
          "eqpmn_mapping_set_v3",
          {
            select:
              "key12,isind_regist_no,stall_no,room_no,vent_mode,blower_count,vent_count",
            order: "key12",
            limit,
            offset,
          }
        );
        all.push(...page);
        if (page.length < limit) break;
        offset += limit;
      }
      return all;
    };

    // mapping rows 조회 (전체)
    const mappingRows = await fetchAllMappings();

    if (mappingRows.length === 0) {
      return NextResponse.json({
        serverNowKst: serverNowKst(),
        items: [],
      } as FarmsSummaryResponseDTO);
    }

    const key12List = mappingRows.map((m) => m.key12);

    const chunkArray = <T,>(arr: T[], size: number) => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    // snapshots 조회 (key12 in 길이 제한 대비)
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
    for (const chunk of chunks) {
      const rows = await supabaseSelect<typeof snapshotRows[number]>(
        "room_raw_snapshot_v3",
        {
          select: "key12,updated_at,es01,es02,es03,es04,es09",
          in: { key12: chunk },
        }
      );
      snapshotRows.push(...rows);
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
    const items: FarmSummaryDTO[] = [];

    for (const [registNo, mappings] of farmMap.entries()) {
      const offlineThSec = await getFarmOfflineThSec(registNo);

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

    const responseData: FarmsSummaryResponseDTO = {
      serverNowKst: nowKst,
      items,
    };
    summaryCache = {
      data: responseData,
      expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
    };
    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, max-age=10, stale-while-revalidate=10",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
