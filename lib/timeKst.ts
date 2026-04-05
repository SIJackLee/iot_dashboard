// KST 변환 유틸리티

const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // 9시간 (밀리초)

/**
 * Date-like 객체를 KST ISO 8601 문자열로 변환
 * @param dateLike - Date 객체, ISO 문자열, 또는 timestamptz 문자열
 * @returns KST ISO 문자열 (예: "2026-01-22T10:45:00+09:00")
 */
export function toKstIso(dateLike: Date | string | null | undefined): string {
  if (!dateLike) {
    return new Date().toISOString().replace("Z", "+09:00");
  }

  let date: Date;
  if (typeof dateLike === "string") {
    // PostgreSQL timestamptz는 +00 또는 Z로 끝날 수 있음
    const normalized = dateLike.replace("Z", "+00:00");
    date = new Date(normalized);
  } else {
    date = dateLike;
  }

  if (isNaN(date.getTime())) {
    return new Date().toISOString().replace("Z", "+09:00");
  }

  // UTC 시간에 9시간을 더해 KST로 변환
  const kstTime = new Date(date.getTime() + KST_OFFSET_MS);
  const iso = kstTime.toISOString();
  return iso.replace("Z", "+09:00");
}

/**
 * 현재 시간을 KST ISO 문자열로 반환
 */
export function serverNowKst(): string {
  return toKstIso(new Date());
}

/**
 * 두 시간 사이의 차이를 초 단위로 계산
 * @param now - 현재 시간 (Date 또는 ISO 문자열)
 * @param dateLike - 비교할 시간
 * @returns 차이 (초)
 */
export function diffSec(
  now: Date | string,
  dateLike: Date | string | null | undefined
): number {
  if (!dateLike) {
    return Infinity;
  }

  const nowDate = typeof now === "string" ? new Date(now) : now;
  const targetDate =
    typeof dateLike === "string" ? new Date(dateLike) : dateLike;

  if (isNaN(nowDate.getTime()) || isNaN(targetDate.getTime())) {
    return Infinity;
  }

  return Math.floor((nowDate.getTime() - targetDate.getTime()) / 1000);
}

/** measure_ts(UTC) 한 점을 KST 달력 날짜 YYYY-MM-DD로 */
export function kstYmdFromMeasureTs(measureTsUtc: string): string {
  return toKstIso(measureTsUtc).slice(0, 10);
}

/**
 * KST 달력 일 하루 구간 — 로그 API from / to(lte)용 (UTC ISO)
 * @param yyyyMmDd KST 기준 YYYY-MM-DD
 */
export function kstDayRangeUtcIso(yyyyMmDd: string): {
  fromUtcIso: string;
  toUtcInclusiveIso: string;
} {
  const start = new Date(`${yyyyMmDd}T00:00:00+09:00`);
  const endInclusive = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return {
    fromUtcIso: start.toISOString(),
    toUtcInclusiveIso: endInclusive.toISOString(),
  };
}

/**
 * KST 달력 월 구간 — log-dates 월 스코프용 (UTC ISO, to는 해당 월 마지막 순간)
 * @param monthYm YYYY-MM
 */
export function kstMonthRangeUtcIso(monthYm: string): {
  fromUtcIso: string;
  toUtcInclusiveIso: string;
} {
  const m = /^(\d{4})-(\d{2})$/.exec(monthYm.trim());
  if (!m) {
    throw new Error(`Invalid month YYYY-MM: ${monthYm}`);
  }
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  if (mo < 1 || mo > 12) {
    throw new Error(`Invalid month YYYY-MM: ${monthYm}`);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = new Date(`${y}-${pad(mo)}-01T00:00:00+09:00`);
  const nextMo = mo === 12 ? 1 : mo + 1;
  const nextY = mo === 12 ? y + 1 : y;
  const nextMonthStart = new Date(`${nextY}-${pad(nextMo)}-01T00:00:00+09:00`);
  const endInclusive = new Date(nextMonthStart.getTime() - 1);
  return {
    fromUtcIso: start.toISOString(),
    toUtcInclusiveIso: endInclusive.toISOString(),
  };
}

/** 브라우저/서버 공통 — Asia/Seoul 달력 기준 오늘 날짜·월 문자열 */
export function kstCalendarTodayParts(): { yyyyMmDd: string; yyyyMm: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  const y = get("year");
  const mo = get("month");
  const d = get("day");
  const yyyyMmDd = `${y}-${mo}-${d}`;
  const yyyyMm = `${y}-${mo}`;
  return { yyyyMmDd, yyyyMm };
}
