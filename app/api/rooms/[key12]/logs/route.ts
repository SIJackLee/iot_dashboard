// GET /api/rooms/[key12]/logs?from=&to=&limit=&cursor=

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst, toKstIso } from "@/lib/timeKst";
import type {
  RoomLogsResponseDTO,
  RoomLogPointDTO,
  SensorsDTO,
  MotorsDTO,
} from "@/types/dto";

type LogsSelectParams = {
  select: string;
  eq: { key12: string };
  order: string;
  limit: number;
  gte?: { measure_ts?: string };
  lte?: { measure_ts?: string };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key12: string }> }
) {
  try {
    const { key12 } = await params;

    const url = new URL(request.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const limitParam = url.searchParams.get("limit");
    const cursorParam = url.searchParams.get("cursor");

    const limit = limitParam ? parseInt(limitParam, 10) : 120;
    const actualLimit = Math.min(Math.max(limit, 1), 300); // 1~300 제한

    // 쿼리 파라미터 구성
    const selectParams: LogsSelectParams = {
      select:
        "key12,measure_ts,created_at,es01,es02,es03,es04,es09,ec01,ec02,ec03",
      eq: { key12 },
      order: "measure_ts.desc",
      limit: actualLimit + 1, // nextCursor 판단용 +1
    };

    // cursor 기반 페이징
    let cursorDate: Date | null = null;
    if (cursorParam) {
      // cursor는 KST ISO 문자열이지만, DB는 UTC이므로 변환 필요
      const parsed = new Date(cursorParam);
      if (!isNaN(parsed.getTime())) {
        cursorDate = parsed;
        selectParams.lte = { measure_ts: parsed.toISOString() };
      }
    }

    // from/to 필터
    if (fromParam) {
      const fromDate = new Date(fromParam);
      if (!isNaN(fromDate.getTime())) {
        selectParams.gte = selectParams.gte || {};
        selectParams.gte.measure_ts = fromDate.toISOString();
      }
    }

    if (toParam) {
      const toDate = new Date(toParam);
      if (!isNaN(toDate.getTime())) {
        selectParams.lte = selectParams.lte || {};
        selectParams.lte.measure_ts = toDate.toISOString();
      }
    }

    let logRows = await supabaseSelect<{
      key12: string;
      measure_ts: string;
      created_at: string;
      es01: number[];
      es02: number[];
      es03: number[];
      es04: number[];
      es09: number[];
      ec01: number[];
      ec02: number[] | null;
      ec03: number[] | null;
    }>("room_state_log_v3", selectParams);

    // cursor 중복 제거 (lte 조건으로 동일 타임스탬프가 섞일 수 있음)
    if (cursorDate) {
      const cursorMs = cursorDate.getTime();
      logRows = logRows.filter(
        (row) => new Date(row.measure_ts).getTime() < cursorMs
      );
    }

    // nextCursor 판단 (limit+1개 조회했으므로)
    let nextCursor: string | undefined;
    const items: RoomLogPointDTO[] = [];

    for (let i = 0; i < Math.min(logRows.length, actualLimit); i++) {
      const row = logRows[i];

      const sensors: SensorsDTO = {
        es01: row.es01 || [],
        es02: row.es02 || [],
        es03: row.es03 || [],
        es04: row.es04 || [],
        es09: row.es09 || [],
      };

      // motors (입기/배기 정책 해제: ec02, ec03 둘 다 반환)
      const motors: MotorsDTO = {
        ec01: row.ec01 || [],
        ventMode: "exhaust",
        ec02: row.ec02 ?? null,
        ec03: row.ec03 ?? null,
        activeVent: row.ec02 || row.ec03 || [],
      };

      items.push({
        measureTsKst: toKstIso(row.measure_ts),
        createdAtKst: toKstIso(row.created_at),
        sensors,
        motors,
      });
    }

    // nextCursor 설정 (limit+1개가 조회되었고, 마지막 항목의 measure_ts 사용)
    if (logRows.length > actualLimit) {
      const lastRow = logRows[actualLimit - 1];
      nextCursor = toKstIso(lastRow.measure_ts);
    }

    return NextResponse.json({
      serverNowKst: serverNowKst(),
      key12,
      items,
      nextCursor,
    } as RoomLogsResponseDTO);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
