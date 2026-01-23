// OFFLINE 프로필/캐시

import { supabaseSelect } from "./supabaseServer";

const OFFLINE_CACHE_TTL_SEC =
  parseInt(process.env.OFFLINE_CACHE_TTL_SEC || "300", 10) * 1000; // 밀리초로 변환
const OFFLINE_LOOKBACK_MIN = parseInt(
  process.env.OFFLINE_LOOKBACK_MIN || "120",
  10
);
const OFFLINE_TH_DEFAULT_SEC = parseInt(
  process.env.OFFLINE_TH_DEFAULT_SEC || "211",
  10
);
const FARM_MIN_SAMPLES = 50; // 최소 표본 수

interface CacheEntry {
  globalP95Sec?: number;
  offlineThSec: number;
  computedAt: number;
}

interface FarmCacheEntry extends CacheEntry {
  n: number;
  farmP95Sec?: number;
}

// 캐시
let globalCache: CacheEntry | null = null;
const farmCache = new Map<string, FarmCacheEntry>();

/**
 * 캐시가 유효한지 확인
 */
function isCacheValid(entry: CacheEntry | null | undefined): boolean {
  if (!entry) {
    return false;
  }
  return Date.now() - entry.computedAt < OFFLINE_CACHE_TTL_SEC;
}

/**
 * 오래된 farm 캐시 정리
 */
function pruneFarmCache(): void {
  for (const [key, entry] of farmCache.entries()) {
    if (!isCacheValid(entry)) {
      farmCache.delete(key);
    }
  }
}

/**
 * offlineThSec 계산 (clamp)
 */
function calculateOfflineThSec(p95Sec: number | null): number {
  if (!p95Sec) {
    return OFFLINE_TH_DEFAULT_SEC;
  }

  // offlineThSec = clamp(max(180, farmP95Sec*3 + 30), 180, 600)
  const calculated = Math.max(180, p95Sec * 3 + 30);
  return Math.min(Math.max(calculated, 180), 600);
}

/**
 * Global OFFLINE 임계값 반환 (캐시 사용)
 */
export async function getGlobalOfflineThSec(): Promise<number> {
  if (isCacheValid(globalCache)) {
    return globalCache!.offlineThSec;
  }

  // 캐시 미스 - 계산 (현재는 기본값 사용)
  // TODO: 실제 global p95 계산 로직 구현 필요
  globalCache = {
    offlineThSec: OFFLINE_TH_DEFAULT_SEC,
    computedAt: Date.now(),
  };

  return globalCache.offlineThSec;
}

/**
 * Farm별 OFFLINE 임계값 반환 (캐시 사용)
 */
export async function getFarmOfflineThSec(
  registNo: string
): Promise<number> {
  pruneFarmCache();
  const cached = farmCache.get(registNo);
  if (cached && isCacheValid(cached)) {
    return cached.offlineThSec;
  }

  // 캐시 미스 - 계산
  try {
    // lookback 시간 계산
    const lookbackDate = new Date();
    lookbackDate.setMinutes(lookbackDate.getMinutes() - OFFLINE_LOOKBACK_MIN);

    // room_state_log_v3에서 key12별 partition으로 p95 계산
    // SQL: SELECT key12, created_at FROM room_state_log_v3
    //      WHERE created_at >= lookbackDate
    //      AND key12 IN (SELECT key12 FROM eqpmn_mapping_set_v3 WHERE isind_regist_no = registNo)
    //      ORDER BY key12, created_at

    const mappingRows = await supabaseSelect<{
      key12: string;
    }>("eqpmn_mapping_set_v3", {
      select: "key12",
      eq: { isind_regist_no: registNo },
    });

    if (mappingRows.length === 0) {
      // 매핑 없음 - 기본값 사용
      const entry: FarmCacheEntry = {
        n: 0,
        offlineThSec: OFFLINE_TH_DEFAULT_SEC,
        computedAt: Date.now(),
      };
      farmCache.set(registNo, entry);
      return entry.offlineThSec;
    }

    const key12List = mappingRows.map((r) => r.key12);

    // room_state_log_v3에서 최근 데이터 조회
    const logRows = await supabaseSelect<{
      key12: string;
      created_at: string;
    }>("room_state_log_v3", {
      select: "key12,created_at",
      in: { key12: key12List },
      gte: { created_at: lookbackDate.toISOString() },
      order: "key12,created_at.asc",
    });

    if (logRows.length < FARM_MIN_SAMPLES) {
      // 표본 부족 - 기본값 사용
      const entry: FarmCacheEntry = {
        n: logRows.length,
        offlineThSec: OFFLINE_TH_DEFAULT_SEC,
        computedAt: Date.now(),
      };
      farmCache.set(registNo, entry);
      return entry.offlineThSec;
    }

    // key12별 partition으로 간격 계산
    const intervals: number[] = [];
    const key12Groups = new Map<string, string[]>();

    for (const row of logRows) {
      if (!key12Groups.has(row.key12)) {
        key12Groups.set(row.key12, []);
      }
      key12Groups.get(row.key12)!.push(row.created_at);
    }

    // 각 key12별로 간격 계산
    for (const [key12, timestamps] of key12Groups.entries()) {
      for (let i = 1; i < timestamps.length; i++) {
        const prev = new Date(timestamps[i - 1]);
        const curr = new Date(timestamps[i]);
        const diffSec = Math.floor((curr.getTime() - prev.getTime()) / 1000);
        if (diffSec > 0 && diffSec < 3600) {
          // 1시간 이내만 유효
          intervals.push(diffSec);
        }
      }
    }

    if (intervals.length === 0) {
      // 간격 없음 - 기본값 사용
      const entry: FarmCacheEntry = {
        n: logRows.length,
        offlineThSec: OFFLINE_TH_DEFAULT_SEC,
        computedAt: Date.now(),
      };
      farmCache.set(registNo, entry);
      return entry.offlineThSec;
    }

    // p95 계산
    intervals.sort((a, b) => a - b);
    const p95Index = Math.floor(intervals.length * 0.95);
    const farmP95Sec = intervals[p95Index] || null;

    const offlineThSec = calculateOfflineThSec(farmP95Sec);

    const entry: FarmCacheEntry = {
      n: intervals.length,
      farmP95Sec: farmP95Sec || undefined,
      offlineThSec,
      computedAt: Date.now(),
    };

    farmCache.set(registNo, entry);
    return entry.offlineThSec;
  } catch (error) {
    console.error(`Error calculating farm offline threshold for ${registNo}:`, error);
    // 에러 시 기본값 사용
    const entry: FarmCacheEntry = {
      n: 0,
      offlineThSec: OFFLINE_TH_DEFAULT_SEC,
      computedAt: Date.now(),
    };
    farmCache.set(registNo, entry);
    return entry.offlineThSec;
  }
}
