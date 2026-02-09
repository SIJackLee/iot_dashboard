// GET /api/rooms/[key12]/command/status?cmd_id=uuid - 명령 상태 조회

import { NextResponse } from "next/server";
import { supabaseSelect } from "@/lib/supabaseServer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key12: string }> }
) {
  try {
    const { key12 } = await params;
    const url = new URL(request.url);
    const cmdId = url.searchParams.get("cmd_id");

    if (!key12 || key12.length !== 12) {
      return NextResponse.json(
        { error: "Invalid key12" },
        { status: 400 }
      );
    }
    if (!cmdId) {
      return NextResponse.json(
        { error: "cmd_id required" },
        { status: 400 }
      );
    }

    const rows = await supabaseSelect<{ status: string }>(
      "room_command_queue_v3",
      {
        select: "status",
        eq: { key12: key12.trim(), cmd_id: cmdId },
        limit: 1,
      }
    );

    const row = rows?.[0];
    if (!row) {
      return NextResponse.json(
        { error: "Command not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      cmd_id: cmdId,
      key12,
      status: row.status,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
