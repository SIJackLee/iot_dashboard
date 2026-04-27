// 서버 전용 Auth 헬퍼.
//
// S1: 현재 로그인 사용자 / role 식별 (getCurrentUser)
// S2: 농가별 조회 범위 계산 (getAllowedRegistNos / getAllowedKey12s / getAccessScope)
// S3: 제어 권한 검증 (assertCanControlKey12)  ← 본 단계에서는 미적용
//
// 모든 함수는 server-only. 클라이언트 컴포넌트에서 import 하면 빌드 시 차단된다.

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
 * '*' 는 admin (전체 접근). string[] 는 허용된 registNo 목록 (빈 배열이면 접근 권한 없음).
 */
export type AllowedRegistNos = "*" | string[];

/**
 * '*' 는 admin (전체 접근). Set<string> 은 허용된 key12 (모두 trim 처리됨).
 */
export type AllowedKey12s = "*" | Set<string>;

export interface AccessScope {
  ctx: CurrentUserContext;
  allowedRegistNos: AllowedRegistNos;
  allowedKey12s: AllowedKey12s;
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
    role = null;
  }

  return {
    user,
    role,
    email: user.email ?? null,
  };
}

/**
 * 사용자에게 허용된 isind_regist_no 목록을 반환.
 *
 * - admin: '*' (전체)
 * - farmer / viewer: user_farm_access.user_id = auth.uid() 조회 결과
 * - role null / 미등록: 빈 배열 (사실상 접근 불가)
 */
export async function getAllowedRegistNos(
  ctx: CurrentUserContext
): Promise<AllowedRegistNos> {
  if (ctx.role === "admin") return "*";

  try {
    const rows = await supabaseSelect<{ isind_regist_no: string | null }>(
      "user_farm_access",
      {
        select: "isind_regist_no",
        eq: { user_id: ctx.user.id },
      }
    );
    const set = new Set<string>();
    for (const row of rows) {
      const v = (row.isind_regist_no ?? "").trim();
      if (v) set.add(v);
    }
    return [...set].sort();
  } catch {
    return [];
  }
}

/**
 * 사용자에게 허용된 key12 집합을 반환.
 *
 * 계산 방식: allowedRegistNos 에 속한 isind_regist_no 의 모든 key12 (trim 처리).
 * - admin: '*' (전체)
 * - 빈 allowedRegistNos: 빈 Set
 */
export async function getAllowedKey12s(
  ctx: CurrentUserContext,
  allowedRegistNos: AllowedRegistNos
): Promise<AllowedKey12s> {
  if (ctx.role === "admin" || allowedRegistNos === "*") return "*";
  if (allowedRegistNos.length === 0) return new Set<string>();

  const set = new Set<string>();
  // Supabase IN 절 안전을 위해 청크 단위로 조회
  const chunkSize = 200;
  for (let i = 0; i < allowedRegistNos.length; i += chunkSize) {
    const chunk = allowedRegistNos.slice(i, i + chunkSize);
    try {
      const rows = await supabaseSelect<{ key12: string }>(
        "eqpmn_mapping_set_v3",
        {
          select: "key12",
          in: { isind_regist_no: chunk },
        }
      );
      for (const row of rows) {
        const k = (row.key12 ?? "").trim();
        if (k) set.add(k);
      }
    } catch {
      // 부분 실패 시 보수적으로 진행 (나머지 청크 시도)
    }
  }
  return set;
}

/**
 * 현재 요청의 접근 범위를 한 번에 계산.
 * 라우트 핸들러 진입부에서 호출.
 */
export async function getAccessScope(): Promise<AccessScope | null> {
  const ctx = await getCurrentUser();
  if (!ctx) return null;
  const allowedRegistNos = await getAllowedRegistNos(ctx);
  const allowedKey12s = await getAllowedKey12s(ctx, allowedRegistNos);
  return { ctx, allowedRegistNos, allowedKey12s };
}

/**
 * registNo 가 접근 허용 범위에 있는지 검사.
 */
export function isRegistNoAllowed(
  allowed: AllowedRegistNos,
  registNo: string
): boolean {
  if (allowed === "*") return true;
  return allowed.includes(registNo.trim());
}

/**
 * key12 가 접근 허용 범위에 있는지 검사 (양쪽 trim 비교).
 */
export function isKey12Allowed(
  allowed: AllowedKey12s,
  key12: string
): boolean {
  if (allowed === "*") return true;
  return allowed.has(key12.trim());
}

/**
 * 캐시 키 산출: 사용자 권한 범위 단위.
 * admin: 'admin' / 그 외: 'rn:<sorted,joined>'
 */
export function makeScopeCacheKey(
  allowedRegistNos: AllowedRegistNos
): string {
  if (allowedRegistNos === "*") return "admin";
  return "rn:" + [...allowedRegistNos].sort().join(",");
}

export type ControlGuardResult =
  | { ok: true; scope: AccessScope }
  | { ok: false; status: 401 | 403; error: string };

/**
 * key12 에 대한 제어(원격 명령) 권한을 검증.
 *
 * - 비로그인: 401
 * - role === 'viewer': 403 (조회 전용)
 * - admin: 통과
 * - farmer: 본인 user_farm_access 의 isind_regist_no 에 속한 key12 만 통과
 * - role === null / 기타: 403
 *
 * key12 비교는 양쪽 trim 처리.
 */
export async function assertCanControlKey12(
  key12: string
): Promise<ControlGuardResult> {
  const scope = await getAccessScope();
  if (!scope) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  const role = scope.ctx.role;
  if (role === "viewer") {
    return { ok: false, status: 403, error: "조회 전용 계정입니다." };
  }
  if (role === "admin") {
    return { ok: true, scope };
  }
  if (role === "farmer") {
    if (isKey12Allowed(scope.allowedKey12s, key12)) {
      return { ok: true, scope };
    }
    return { ok: false, status: 403, error: "해당 장비의 제어 권한이 없습니다." };
  }
  return { ok: false, status: 403, error: "제어 권한이 없습니다." };
}
