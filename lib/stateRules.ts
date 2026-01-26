// WARN/DANGER/STATE 규칙

import type { RoomState, IntArray } from "@/types/dto";

// 센서별 임계값 (placeholder, 추후 교체 가능)
// 단위 주의: ES01/02/04/09는 x10 스케일
const SENSOR_THRESHOLDS = {
  es01: { warn: 300, danger: 350 }, // 온도 30.0C / 35.0C
  es02: { warn: 800, danger: 900 }, // 습도 80% / 90%
  es03: { warn: 2500, danger: 3700 }, // CO2 ppm
  es04: { warn: 200, danger: 300 }, // NH3 20ppm / 30ppm (x10)
  es09: { warn: 600, danger: 800 }, // 음압 60Pa / 80Pa (x10)
};

interface SnapshotData {
  es01: IntArray;
  es02: IntArray;
  es03: IntArray;
  es04: IntArray;
  es09: IntArray;
}

/**
 * 센서 배열에서 최대값 추출
 */
function getSensorMax(values: IntArray): number {
  const cleaned = values.filter((v) => v != null && !isNaN(v));
  if (cleaned.length === 0) return 0;
  return Math.max(...cleaned);
}

/**
 * Room 상태 계산
 * @param snapshot - 센서 데이터
 * @param offlineThSec - OFFLINE 임계값 (초)
 * @param freshnessSec - freshnessSec (현재 시간 - updated_at)
 * @returns RoomState
 */
export function calculateState(
  snapshot: SnapshotData,
  offlineThSec: number,
  freshnessSec: number
): RoomState {
  // 1) freshnessSec > offlineThSec => offline
  if (freshnessSec > offlineThSec) {
    return "offline";
  }

  // 2) 센서별 최대값 계산
  const maxValues = {
    es01: getSensorMax(snapshot.es01),
    es02: getSensorMax(snapshot.es02),
    es03: getSensorMax(snapshot.es03),
    es04: getSensorMax(snapshot.es04),
    es09: getSensorMax(snapshot.es09),
  };

  // 3) 센서별 임계값 비교
  const dangerHit = Object.entries(maxValues).some(([key, value]) => {
    const t = SENSOR_THRESHOLDS[key as keyof typeof SENSOR_THRESHOLDS];
    return value >= t.danger;
  });
  if (dangerHit) return "danger";

  const warnHit = Object.entries(maxValues).some(([key, value]) => {
    const t = SENSOR_THRESHOLDS[key as keyof typeof SENSOR_THRESHOLDS];
    return value >= t.warn;
  });
  if (warnHit) return "warn";

  return "normal";
}

/**
 * 임계값 설정 (추후 교체용)
 */
export function setThresholds(): void {
  // TODO: 환경 변수나 설정 파일에서 읽도록 변경 가능
}
