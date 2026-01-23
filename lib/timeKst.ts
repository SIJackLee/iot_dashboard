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
