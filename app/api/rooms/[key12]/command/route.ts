// POST /api/rooms/[key12]/command - 모터 명령 전송

import { NextResponse } from "next/server";
import { supabaseInsert } from "@/lib/supabaseServer";

type MotorEq = "EC01" | "EC02" | "EC03";

interface CommandAction {
  eq: MotorEq;
  op: "SET_RPM" | "SET_RPM_PCT";
  rpm?: number;
  pct?: number;
}

interface CommandBody {
  actions: CommandAction[];
  ttl_sec?: number;
  priority?: number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ key12: string }> }
) {
  try {
    const { key12 } = await params;

    if (!key12 || key12.length !== 12) {
      return NextResponse.json(
        { error: "Invalid key12 (12자리 필수)" },
        { status: 400 }
      );
    }

    let body: CommandBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { actions = [], ttl_sec = 10, priority = 0 } = body;

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: "actions 배열이 비어 있음 (최소 1개 필수)" },
        { status: 400 }
      );
    }

    const validEqs: MotorEq[] = ["EC01", "EC02", "EC03"];

    for (const a of actions) {
      if (!a.eq || !validEqs.includes(a.eq)) {
        return NextResponse.json(
          { error: `Invalid eq: ${a.eq} (EC01/EC02/EC03만 허용)` },
          { status: 400 }
        );
      }
      if (a.op === "SET_RPM" && (typeof a.rpm !== "number" || a.rpm < 0)) {
        return NextResponse.json(
          { error: `SET_RPM requires rpm (number >= 0)` },
          { status: 400 }
        );
      }
      if (a.op === "SET_RPM_PCT" && (typeof a.pct !== "number" || a.pct < 0 || a.pct > 100)) {
        return NextResponse.json(
          { error: `SET_RPM_PCT requires pct (0-100)` },
          { status: 400 }
        );
      }
    }

    const row = await supabaseInsert<{ cmd_id: string }>(
      "room_command_queue_v3",
      {
        key12: key12.trim(),
        status: "NEW",
        ttl_sec: Math.min(3600, Math.max(0, ttl_sec)),
        actions,
        priority: Math.min(10, Math.max(-10, priority)),
      }
    );

    const inserted = Array.isArray(row) ? row[0] : row;
    const cmdId = inserted?.cmd_id ?? null;

    return NextResponse.json({
      success: true,
      cmd_id: cmdId,
      key12,
      message: "명령이 큐에 등록되었습니다. cmd_gateway가 처리합니다.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
