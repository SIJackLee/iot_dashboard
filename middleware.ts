// 페이지 라우트 가드 (1단계 범위)
//
// 보호 대상: /, /farms/*, /rooms/*, /dashboard/*
// 비보호 대상: /api/* (헬스체크/폴링/로그인 콜백 보존), /login, 정적 자원
//
// 비로그인 사용자가 보호 라우트에 접근하면 /login?next=<원래경로> 로 리다이렉트한다.
// 세션 토큰 자동 갱신을 위해 createServerClient 의 cookie set 을 통해 응답 쿠키도 갱신한다.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // 환경변수 누락 시 가드 동작을 비활성화하여 빌드/런타임 회귀를 방지.
    // 운영 환경 점검은 Vercel 환경변수 설정으로 보장한다.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = request.nextUrl.pathname + request.nextUrl.search;
    if (nextPath && nextPath !== "/login") {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/farms/:path*",
    "/rooms/:path*",
    "/dashboard/:path*",
  ],
};
