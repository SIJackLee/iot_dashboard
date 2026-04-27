// GET /api/me - 현재 로그인 사용자의 email/role 반환
// 비로그인 시에도 200 + { email: null, role: null } 로 응답하여
// TopBar 등에서 단순 표시 분기에만 사용한다.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";

export async function GET() {
  const ctx = await getCurrentUser();
  if (!ctx) {
    return NextResponse.json(
      { email: null, role: null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(
    { email: ctx.email, role: ctx.role },
    { headers: { "Cache-Control": "no-store" } }
  );
}
