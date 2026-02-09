// GET /api/farms/[registNo]/detail?stallNo=1|2|3

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst, toKstIso, diffSec } from "@/lib/timeKst";
import { getFarmOfflineThSec } from "@/lib/offlineProfile";
import { calculateState } from "@/lib/stateRules";
import type { FarmDetailDTO, StallDetailDTO, RoomSnapshotLiteDTO } from "@/types/dto";

type MappingSelectParams = {
  select: string;
  eq: {
    isind_regist_no: string;
    stall_no?: number;
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ registNo: string }> }
) {
  try {
    const { registNo } = await params;

    const url = new URL(request.url);
    const stallNoParam = url.searchParams.get("stallNo");

    // mapping rows 조회
    const selectParams: MappingSelectParams = {
      select:
        "key12,isind_regist_no,stall_no,room_no,vent_mode,blower_count,vent_count",
      eq: { isind_regist_no: registNo },
    };

    if (stallNoParam) {
      const stallNo = parseInt(stallNoParam, 10);
      if (!isNaN(stallNo) && stallNo >= 1 && stallNo <= 3) {
        selectParams.eq.stall_no = stallNo;
      }
    }

    const mappingRows = await supabaseSelect<{
      key12: string;
      isind_regist_no: string;
      stall_no: number;
      room_no: number;
      vent_mode: string;
      blower_count: number;
      vent_count: number;
    }>("eqpmn_mapping_set_v3", selectParams);

    if (mappingRows.length === 0) {
      return NextResponse.json({
        serverNowKst: serverNowKst(),
        farm: { registNo, totalRooms: 0 },
        summary: { normal: 0, warn: 0, danger: 0, offline: 0, lastUpdatedAtKst: null },
        stalls: [],
      } as FarmDetailDTO, {
        headers: {
          "Cache-Control": "public, max-age=3, stale-while-revalidate=3",
        },
      });
    }

    const key12List = mappingRows.map((m) => m.key12);

    // snapshots 조회
    const snapshotRows = await supabaseSelect<{
      key12: string;
      measure_ts: string;
      updated_at: string;
      es01: number[];
      es02: number[];
      es03: number[];
      es04: number[];
      es09: number[];
      ec01: number[];
      ec02: number[] | null;
      ec03: number[] | null;
    }>("room_raw_snapshot_v3", {
      select:
        "key12,measure_ts,updated_at,es01,es02,es03,es04,es09,ec01,ec02,ec03",
      in: { key12: key12List },
    });

    const now = new Date();
    const nowKst = serverNowKst();
    const offlineThSec = await getFarmOfflineThSec(registNo);

    // stallNo별로 그룹화
    const stallMap = new Map<number, typeof mappingRows>();
    for (const mapping of mappingRows) {
      const stallNo = mapping.stall_no;
      if (!stallMap.has(stallNo)) {
        stallMap.set(stallNo, []);
      }
      stallMap.get(stallNo)!.push(mapping);
    }

    const stalls: StallDetailDTO[] = [];
    let normal = 0;
    let warn = 0;
    let danger = 0;
    let offline = 0;
    let lastUpdatedAt: Date | null = null;
    const freshnessSecs: number[] = [];

    for (const [stallNo, mappings] of Array.from(stallMap.entries()).sort()) {
      const rooms: RoomSnapshotLiteDTO[] = [];

      for (const mapping of mappings) {
        const snapshot = snapshotRows.find((s) => s.key12 === mapping.key12);
        if (!snapshot) continue; // 조회 가능한 데이터 없는 방은 표시 제외

        const updatedAt = new Date(snapshot.updated_at);
        if (!lastUpdatedAt || updatedAt > lastUpdatedAt) {
          lastUpdatedAt = updatedAt;
        }

        const freshnessSec = diffSec(now, snapshot.updated_at);
        freshnessSecs.push(freshnessSec);

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

        rooms.push({
          key12: mapping.key12,
          stallNo: mapping.stall_no,
          roomNo: mapping.room_no,
          ventMode: mapping.vent_mode as "exhaust" | "intake",
          blowerCount: mapping.blower_count,
          ventCount: mapping.vent_count,
          measureTsKst: toKstIso(snapshot.measure_ts),
          updatedAtKst: toKstIso(snapshot.updated_at),
          freshnessSec,
          state,
        });
      }

      // 조회 가능한 데이터가 있는 방이 1건 이상인 축사만 표시
      if (rooms.length > 0) {
        stalls.push({
          stallNo,
          rooms: rooms.sort((a, b) => a.roomNo - b.roomNo),
        });
      }
    }

    // freshness P50/P95 계산
    let freshnessP50Sec: number | undefined;
    let freshnessP95Sec: number | undefined;

    if (freshnessSecs.length > 0) {
      const sorted = [...freshnessSecs].sort((a, b) => a - b);
      const p50Index = Math.floor(sorted.length * 0.5);
      const p95Index = Math.floor(sorted.length * 0.95);
      freshnessP50Sec = sorted[p50Index];
      freshnessP95Sec = sorted[p95Index];
    }

    const totalRooms = stalls.reduce((sum, s) => sum + s.rooms.length, 0);
    return NextResponse.json({
      serverNowKst: nowKst,
      farm: {
        registNo,
        totalRooms,
      },
      summary: {
        normal,
        warn,
        danger,
        offline,
        lastUpdatedAtKst: lastUpdatedAt ? toKstIso(lastUpdatedAt) : null,
        freshnessP50Sec,
        freshnessP95Sec,
      },
      stalls,
    } as FarmDetailDTO, {
      headers: {
        "Cache-Control": "public, max-age=3, stale-while-revalidate=3",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
