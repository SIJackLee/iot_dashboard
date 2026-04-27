// 서버 전용 Auth 헬퍼.
// 1단계 범위: 현재 로그인 사용자와 role 만 식별한다.
// 조회/제어 권한 필터(getAllowedRegistNos / assertCanControlKey12 등)는 2·3단계에서 추가한다.

import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseSelect } from "@/lib/supabaseServer";

export type AppRole = "admin" | "farmer" | "viewer";

export interface CurrentUserContext {
  user: User;
  role: AppRole | null;
  email: string | null;
}

/**
 * 현재 요청의 로그인 사용자를 반환. 비로그인 시 null.
 *
 * profiles.role 조회는 service_role 로 이뤄지며(서버 전용),
 * RLS 가 켜져 있지 않은 현재 환경에서도 동작한다.
 */
export async function getCurrentUser(): Promise<CurrentUserContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let role: AppRole | null = null;
  try {
    const rows = await supabaseSelect<{ role: string | null }>("profiles", {
      select: "role",
      eq: { id: user.id },
      limit: 1,
    });
    const raw = rows?.[0]?.role;
    if (raw === "admin" || raw === "farmer" || raw === "viewer") {
      role = raw;
    }
  } catch {
    // role 조회 실패는 치명적이지 않음 → null 처리하여 호출자가 결정
    role = null;
  }

  return {
    user,
    role,
    email: user.email ?? null,
  };
}
