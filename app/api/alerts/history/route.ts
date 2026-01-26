// GET /api/alerts/history?range=6h&limit=50&states=warn,danger,offline

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst, toKstIso, diffSec } from "@/lib/timeKst";
import { calculateState } from "@/lib/stateRules";
import { getFarmOfflineThSec } from "@/lib/offlineProfile";

type LogRow = {
  key12: string;
  measure_ts: string;
  created_at: string;
  es01: number[];
  es02: number[];
  es03: number[];
  es04: number[];
  es09: number[];
};

type SnapshotRow = {
  key12: string;
  updated_at: string;
  es01: number[];
  es02: number[];
  es03: number[];
  es04: number[];
  es09: number[];
};

type MappingRow = {
  key12: string;
  isind_regist_no: string;
  stall_no: number;
  room_no: number;
};

type HistoryItem = {
  key12: string;
  registNo: string;
  stallNo: number;
  roomNo: number;
  state: "normal" | "warn" | "danger" | "offline";
  occurredAtKst: string;
  maxValues: {
    es01: number;
    es02: number;
    es03: number;
    es04: number;
    es09: number;
  };
};

const RANGE_TO_MIN: Record<string, number> = {
  "1h": 60,
  "6h": 360,
  "24h": 1440,
};

function getMax(values: number[] | null | undefined): number {
  if (!values || values.length === 0) return 0;
  return Math.max(...values);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "6h";
    const limitParam = url.searchParams.get("limit");
    const statesParam = url.searchParams.get("states") || "warn,danger,offline";

    const rangeMin = RANGE_TO_MIN[range] ?? RANGE_TO_MIN["6h"];
    const limit = Math.min(Math.max(parseInt(limitParam || "50", 10), 1), 200);
    const stateSet = new Set(
      statesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );

    const now = new Date();
    const from = new Date(now.getTime() - rangeMin * 60 * 1000);

    const logRows = await supabaseSelect<LogRow>("room_state_log_v3", {
      select: "key12,measure_ts,created_at,es01,es02,es03,es04,es09",
      gte: { created_at: from.toISOString() },
      order: "created_at.desc",
      limit: Math.max(limit * 3, 200),
    });

    const snapshotRows = await supabaseSelect<SnapshotRow>("room_raw_snapshot_v3", {
      select: "key12,updated_at,es01,es02,es03,es04,es09",
      order: "updated_at.desc",
      limit: limit,
    });

    const key12Set = new Set<string>([
      ...logRows.map((row) => row.key12),
      ...snapshotRows.map((row) => row.key12),
    ]);

    const key12List = Array.from(key12Set);
    const chunk = <T,>(arr: T[], size: number) =>
      Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
      );

    const mappingRows: MappingRow[] = [];
    for (const group of chunk(key12List, 500)) {
      const rows = await supabaseSelect<MappingRow>("eqpmn_mapping_set_v3", {
        select: "key12,isind_regist_no,stall_no,room_no",
        in: { key12: group },
      });
      mappingRows.push(...rows);
    }

    const mappingMap = new Map(mappingRows.map((m) => [m.key12, m]));
    const items: HistoryItem[] = [];

    for (const row of logRows) {
      const mapping = mappingMap.get(row.key12);
      if (!mapping) continue;
      const state = calculateState(
        {
          es01: row.es01 || [],
          es02: row.es02 || [],
          es03: row.es03 || [],
          es04: row.es04 || [],
          es09: row.es09 || [],
        },
        Number.MAX_SAFE_INTEGER,
        0
      );
      if (!stateSet.has(state)) continue;

      items.push({
        key12: row.key12,
        registNo: mapping.isind_regist_no,
        stallNo: mapping.stall_no,
        roomNo: mapping.room_no,
        state,
        occurredAtKst: toKstIso(row.created_at),
        maxValues: {
          es01: getMax(row.es01),
          es02: getMax(row.es02),
          es03: getMax(row.es03),
          es04: getMax(row.es04),
          es09: getMax(row.es09),
        },
      });
    }

    if (stateSet.has("offline")) {
      for (const row of snapshotRows) {
        const mapping = mappingMap.get(row.key12);
        if (!mapping) continue;
        const offlineThSec = await getFarmOfflineThSec(mapping.isind_regist_no);
        const freshnessSec = diffSec(now, row.updated_at);
        const state = calculateState(
          {
            es01: row.es01 || [],
            es02: row.es02 || [],
            es03: row.es03 || [],
            es04: row.es04 || [],
            es09: row.es09 || [],
          },
          offlineThSec,
          freshnessSec
        );
        if (state !== "offline") continue;
        items.push({
          key12: row.key12,
          registNo: mapping.isind_regist_no,
          stallNo: mapping.stall_no,
          roomNo: mapping.room_no,
          state,
          occurredAtKst: toKstIso(row.updated_at),
          maxValues: {
            es01: getMax(row.es01),
            es02: getMax(row.es02),
            es03: getMax(row.es03),
            es04: getMax(row.es04),
            es09: getMax(row.es09),
          },
        });
      }
    }

    items.sort((a, b) => new Date(b.occurredAtKst).getTime() - new Date(a.occurredAtKst).getTime());

    return NextResponse.json({
      serverNowKst: serverNowKst(),
      items: items.slice(0, limit),
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
