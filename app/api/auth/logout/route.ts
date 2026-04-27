// POST /api/auth/logout - 세션 종료 후 /login 으로 리다이렉트

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const url = new URL("/login", request.url);
  return NextResponse.redirect(url, { status: 303 });
}
