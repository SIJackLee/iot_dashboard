// GET /api/rooms/[key12]

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst, toKstIso, diffSec } from "@/lib/timeKst";
import { getFarmOfflineThSec } from "@/lib/offlineProfile";
import { calculateState } from "@/lib/stateRules";
import type { RoomSnapshotFullDTO, SensorsDTO, MotorsDTO } from "@/types/dto";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key12: string }> }
) {
  try {
    const { key12 } = await params;

    // mapping row 조회
    const mappingRows = await supabaseSelect<{
      key12: string;
      isind_regist_no: string;
      species: number | null;
      species_code: string | null;
      stall_ty_code: number;
      stall_no: number;
      room_no: number;
      vent_mode: string;
      blower_count: number;
      vent_count: number;
    }>("eqpmn_mapping_set_v3", {
      select:
        "key12,isind_regist_no,species,species_code,stall_ty_code,stall_no,room_no,vent_mode,blower_count,vent_count",
      eq: { key12 },
      limit: 1,
    });

    if (mappingRows.length === 0) {
      return NextResponse.json(
        { error: "Not Found: key12 not found" },
        { status: 404 }
      );
    }

    const mapping = mappingRows[0];
    const registNo = mapping.isind_regist_no;

    // snapshot row 조회
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
      eq: { key12 },
      limit: 1,
    });

    if (snapshotRows.length === 0) {
      return NextResponse.json(
        { error: "Not Found: snapshot not found" },
        { status: 404 }
      );
    }

    const snapshot = snapshotRows[0];
    const now = new Date();
    const nowKst = serverNowKst();
    const offlineThSec = await getFarmOfflineThSec(registNo);

    const freshnessSec = diffSec(now, snapshot.updated_at);

    // state 계산
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

    // sensors DTO
    const sensors: SensorsDTO = {
      es01: snapshot.es01 || [],
      es02: snapshot.es02 || [],
      es03: snapshot.es03 || [],
      es04: snapshot.es04 || [],
      es09: snapshot.es09 || [],
    };

    // motors DTO (입기/배기 정책 해제: ec02, ec03 둘 다 반환)
    const ventMode = mapping.vent_mode as "exhaust" | "intake";
    const ec01 = snapshot.ec01 || [];
    const ec02 = snapshot.ec02 ?? null;
    const ec03 = snapshot.ec03 ?? null;

    const motors: MotorsDTO = {
      ec01,
      ventMode,
      ec02,
      ec03,
      activeVent: ec02 || ec03 || [],
    };

    return NextResponse.json({
      serverNowKst: nowKst,
      mapping: {
        key12: mapping.key12,
        registNo: mapping.isind_regist_no,
        species: mapping.species ?? undefined,
        speciesCode: mapping.species_code ?? undefined,
        stallTyCode: mapping.stall_ty_code,
        stallNo: mapping.stall_no,
        roomNo: mapping.room_no,
        ventMode,
        blowerCount: mapping.blower_count,
        ventCount: mapping.vent_count,
      },
      timing: {
        measureTsKst: toKstIso(snapshot.measure_ts),
        updatedAtKst: toKstIso(snapshot.updated_at),
        freshnessSec,
      },
      state,
      sensors,
      motors,
    } as RoomSnapshotFullDTO, {
      headers: {
        "Cache-Control": "public, max-age=3, stale-while-revalidate=3",
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      {
        status: message.includes("Not Found")
          ? 404
          : 500,
      }
    );
  }
}
