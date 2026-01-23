// GET /api/health

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";
import { serverNowKst } from "@/lib/timeKst";

export async function GET() {
  // DB 연결 확인
  let dbOk = false;
  try {
    await supabaseSelect("room_raw_snapshot_v3", { limit: 1 });
    dbOk = true;
  } catch (error) {
    dbOk = false;
  }

  const offlineDefaultThSec = parseInt(
    process.env.OFFLINE_TH_DEFAULT_SEC || "211",
    10
  );
  const cacheTTL = parseInt(
    process.env.OFFLINE_CACHE_TTL_SEC || "300",
    10
  );
  const lookback = parseInt(
    process.env.OFFLINE_LOOKBACK_MIN || "120",
    10
  );

  return NextResponse.json({
    dbOk,
    serverNowKst: serverNowKst(),
    offlineDefaultThSec,
    cacheTTL,
    lookback,
  });
}
