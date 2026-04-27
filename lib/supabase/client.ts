// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// NEXT_PUBLIC_* 만 사용한다. service_role 키는 절대 import 하지 않는다.

"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되어 있지 않습니다."
    );
  }
  return createBrowserClient(url, anonKey);
}
