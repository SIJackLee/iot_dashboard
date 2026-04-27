// GET /api/rooms/[key12]/log-dates?month=YYYY-MM
// 해당 월(KST)에 measure_ts가 존재하는 날짜만 distinct (내림차순)

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst, kstMonthRangeUtcIso, kstYmdFromMeasureTs } from "@/lib/timeKst";
import { getAccessScope, isKey12Allowed } from "@/lib/auth/server";
import type { RoomLogDatesResponseDTO } from "@/types/dto";

const PAGE_SIZE = 300;
const MAX_PAGES = 200;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key12: string }> }
) {
  try {
    const { key12: rawKey12 } = await params;
    const key12 = rawKey12.trim();

    const scope = await getAccessScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isKey12Allowed(scope.allowedKey12s, key12)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    let monthYm = url.searchParams.get("month")?.trim() ?? "";

    if (!monthYm) {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
      }).formatToParts(new Date());
      const y = parts.find((p) => p.type === "year")?.value ?? "";
      const mo = parts.find((p) => p.type === "month")?.value ?? "";
      monthYm = `${y}-${mo}`;
    }

    const { fromUtcIso, toUtcInclusiveIso } = kstMonthRangeUtcIso(monthYm);

    const dates = new Set<string>();
    let cursorDate: Date | null = null;

    const upperMs = new Date(toUtcInclusiveIso).getTime();

    for (let page = 0; page < MAX_PAGES; page++) {
      const lteMs = cursorDate
        ? Math.min(cursorDate.getTime(), upperMs)
        : upperMs;
      const lteBound = new Date(lteMs).toISOString();

      let rows: { measure_ts: string }[] = await supabaseSelect<{
        measure_ts: string;
      }>("room_state_log_v3", {
        select: "measure_ts",
        eq: { key12 },
        order: "measure_ts.desc",
        limit: PAGE_SIZE,
        gte: { measure_ts: fromUtcIso },
        lte: { measure_ts: lteBound },
      });

      if (cursorDate) {
        const cursorMs = cursorDate.getTime();
        rows = rows.filter(
          (row: { measure_ts: string }) =>
            new Date(row.measure_ts).getTime() < cursorMs
        );
      }

      for (const row of rows) {
        dates.add(kstYmdFromMeasureTs(row.measure_ts));
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }

      const oldest: { measure_ts: string } = rows[rows.length - 1]!;
      cursorDate = new Date(oldest.measure_ts);
    }

    const sortedDesc = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

    return NextResponse.json({
      serverNowKst: serverNowKst(),
      key12,
      month: monthYm,
      dates: sortedDesc,
    } satisfies RoomLogDatesResponseDTO);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
