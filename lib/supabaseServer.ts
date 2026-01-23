// Supabase 서버 접근 유틸리티 (fetch 기반 REST 호출)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
  );
}

const BASE_URL = `${SUPABASE_URL}/rest/v1`;
const DEFAULT_TIMEOUT_MS = parseInt(
  process.env.SUPABASE_TIMEOUT_MS || "10000",
  10
);

const DEFAULT_HEADERS = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

interface SelectParams {
  select?: string;
  eq?: Record<string, string | number>;
  in?: Record<string, (string | number)[]>;
  order?: string;
  limit?: number;
  offset?: number;
  gte?: Record<string, string>;
  lte?: Record<string, string>;
}

/**
 * Supabase 테이블 SELECT 쿼리
 */
export async function supabaseSelect<T = any>(
  table: string,
  params: SelectParams = {}
): Promise<T[]> {
  const url = new URL(`${BASE_URL}/${table}`);
  const { select, eq, in: inParam, order, limit, offset, gte, lte } = params;

  if (select) {
    url.searchParams.set("select", select);
  }

  // eq 필터
  if (eq) {
    for (const [key, value] of Object.entries(eq)) {
      url.searchParams.set(`${key}`, `eq.${value}`);
    }
  }

  // in 필터
  if (inParam) {
    for (const [key, values] of Object.entries(inParam)) {
      url.searchParams.set(`${key}`, `in.(${values.join(",")})`);
    }
  }

  // gte 필터
  if (gte) {
    for (const [key, value] of Object.entries(gte)) {
      url.searchParams.set(`${key}`, `gte.${value}`);
    }
  }

  // lte 필터
  if (lte) {
    for (const [key, value] of Object.entries(lte)) {
      url.searchParams.set(`${key}`, `lte.${value}`);
    }
  }

  if (order) {
    url.searchParams.set("order", order);
  }

  if (limit) {
    url.searchParams.set("limit", limit.toString());
  }

  if (offset) {
    url.searchParams.set("offset", offset.toString());
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: DEFAULT_HEADERS,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase query failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

/**
 * Supabase RPC 호출
 */
export async function supabaseRpc<T = any>(
  functionName: string,
  params: Record<string, any> = {}
): Promise<T> {
  const url = `${BASE_URL}/rpc/${functionName}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const response = await fetch(url, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(params),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase RPC failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}
