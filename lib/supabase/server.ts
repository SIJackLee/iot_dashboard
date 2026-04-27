// 서버(라우트 핸들러 / 서버 컴포넌트 / 미들웨어)용 Supabase 클라이언트.
// anon key + 쿠키 기반 세션을 사용하며, service_role 키는 사용하지 않는다.

import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되어 있지 않습니다."
    );
  }
  return { url, anonKey };
}

/**
 * 라우트 핸들러 / 서버 컴포넌트에서 사용하는 Supabase 클라이언트.
 *
 * Next.js 16 의 cookies() 는 비동기이므로 await 후 전달한다.
 * 서버 컴포넌트(읽기 전용 컨텍스트)에서 set 호출 시 throw 가 발생할 수 있어
 * try/catch 로 감싼다. 미들웨어/라우트 핸들러 컨텍스트에서는 정상 동작.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // 서버 컴포넌트(read-only) 컨텍스트에서는 무시
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // 서버 컴포넌트(read-only) 컨텍스트에서는 무시
        }
      },
    },
  });
}
