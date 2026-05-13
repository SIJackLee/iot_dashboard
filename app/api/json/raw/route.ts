import { NextResponse } from "next/server";
import { getAccessScope, type AllowedRegistNos } from "@/lib/auth/server";
import { serverNowKst, toKstIso } from "@/lib/timeKst";
import type {
  JsonRawEqpmnDTO,
  JsonRawItemDTO,
  JsonRawListResponseDTO,
  JsonRawPayloadDTO,
  JsonPrimitive,
  JsonValue,
} from "@/types/dto";

const TABLE_NAME = "iot_room_state_json_raw";
const SELECT_COLUMNS = "id,regist_no,topic,payload,received_at,saved_at";
const PAGE_SIZE = 200;

interface JsonRawDbRow {
  id: number;
  regist_no: string;
  topic: string;
  payload: unknown;
  received_at: string | null;
  saved_at: string | null;
}

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  }

  return {
    baseUrl: `${url}/rest/v1/${TABLE_NAME}`,
    serviceRoleKey,
  };
}

function buildHeaders(preferCount = false): HeadersInit {
  const { serviceRoleKey } = getSupabaseEnv();
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: preferCount ? "count=exact" : "return=representation",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonPrimitive(value: unknown): JsonPrimitive {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return String(value);
}

function toJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }

  if (isRecord(value)) {
    const result: { [key: string]: JsonValue } = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = toJsonValue(entry);
    }
    return result;
  }

  return String(value);
}

function normalizeEqpmn(value: unknown): JsonRawEqpmnDTO[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items: JsonRawEqpmnDTO[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) continue;
    const name = typeof entry.name === "string" ? entry.name : String(entry.name ?? "");
    if (!name) continue;
    items.push({
      name,
      values: toJsonValue(entry.values),
    });
  }
  return items;
}

function normalizePayload(payload: unknown): JsonRawPayloadDTO {
  if (!isRecord(payload)) {
    return {};
  }

  const normalized: JsonRawPayloadDTO = {};
  for (const [key, value] of Object.entries(payload)) {
    normalized[key] = toJsonValue(value);
  }

  if ("typ" in payload) {
    normalized.typ = toJsonPrimitive(payload.typ);
  }
  if ("seq" in payload) {
    normalized.seq = toJsonPrimitive(payload.seq);
  }
  if ("measure_ts" in payload) {
    normalized.measure_ts =
      payload.measure_ts === null || typeof payload.measure_ts === "string"
        ? payload.measure_ts
        : String(payload.measure_ts);
  }

  const eqpmn = normalizeEqpmn(payload.eqpmn);
  if (eqpmn) {
    normalized.eqpmn = eqpmn;
  }

  return normalized;
}

function buildRegistNoFilter(allowedRegistNos: AllowedRegistNos): string | null {
  if (allowedRegistNos === "*") return null;
  if (allowedRegistNos.length === 0) return "empty";
  const encoded = allowedRegistNos
    .map((value) => `"${value.replace(/"/g, '\\"')}"`)
    .join(",");
  return `in.(${encoded})`;
}

async function fetchRawRows(
  allowedRegistNos: AllowedRegistNos
): Promise<{ rows: JsonRawDbRow[]; totalCount: number }> {
  const { baseUrl } = getSupabaseEnv();
  const registNoFilter = buildRegistNoFilter(allowedRegistNos);

  if (registNoFilter === "empty") {
    return { rows: [], totalCount: 0 };
  }

  const dataUrl = new URL(baseUrl);
  dataUrl.searchParams.set("select", SELECT_COLUMNS);
  dataUrl.searchParams.set("order", "saved_at.desc");
  dataUrl.searchParams.set("limit", String(PAGE_SIZE));

  const countUrl = new URL(baseUrl);
  countUrl.searchParams.set("select", "id");
  countUrl.searchParams.set("limit", "1");

  if (registNoFilter) {
    dataUrl.searchParams.set("regist_no", registNoFilter);
    countUrl.searchParams.set("regist_no", registNoFilter);
  }

  const [dataResponse, countResponse] = await Promise.all([
    fetch(dataUrl.toString(), {
      method: "GET",
      headers: buildHeaders(false),
      cache: "no-store",
    }),
    fetch(countUrl.toString(), {
      method: "GET",
      headers: buildHeaders(true),
      cache: "no-store",
    }),
  ]);

  if (!dataResponse.ok) {
    throw new Error(`JSON raw fetch failed: ${dataResponse.status}`);
  }
  if (!countResponse.ok) {
    throw new Error(`JSON raw count failed: ${countResponse.status}`);
  }

  const rows = (await dataResponse.json()) as JsonRawDbRow[];
  const contentRange = countResponse.headers.get("content-range");
  const totalCount =
    contentRange && contentRange.includes("/")
      ? Number.parseInt(contentRange.split("/")[1] ?? "0", 10)
      : rows.length;

  return {
    rows,
    totalCount: Number.isFinite(totalCount) ? totalCount : rows.length,
  };
}

function mapRow(row: JsonRawDbRow): JsonRawItemDTO {
  return {
    id: row.id,
    registNo: row.regist_no,
    topic: row.topic,
    payload: normalizePayload(row.payload),
    receivedAtKst: row.received_at ? toKstIso(row.received_at) : null,
    savedAtKst: row.saved_at ? toKstIso(row.saved_at) : null,
  };
}

function getLatestReceivedAt(items: JsonRawItemDTO[]): string | null {
  let latest: string | null = null;

  for (const item of items) {
    if (!item.receivedAtKst) continue;
    if (!latest || new Date(item.receivedAtKst) > new Date(latest)) {
      latest = item.receivedAtKst;
    }
  }

  return latest;
}

export async function GET() {
  try {
    const scope = await getAccessScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows, totalCount } = await fetchRawRows(scope.allowedRegistNos);
    const items = rows.map(mapRow);

    return NextResponse.json(
      {
        serverNowKst: serverNowKst(),
        totalCount,
        latestReceivedAtKst: getLatestReceivedAt(items),
        latestTopic: items[0]?.topic ?? null,
        items,
      } satisfies JsonRawListResponseDTO,
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
