/**
 * 센서·모터 지표별 식별색 (카드 배경, 스파크라인 fill, Recharts 선 공통).
 * 위험 강조 빨강은 #ef4444로 별도 사용(SensorCard 스파크라인 stroke 등).
 */

export type SensorMetricKey = "es01" | "es02" | "es03" | "es04" | "es09";
export type MotorMetricKey = "ec01" | "ec02" | "ec03";

export const DANGER_STROKE_HEX = "#ef4444";

export interface MetricChrome {
  bg: string;
  border: string;
  /** SVG stroke / Recharts 선 / 그라데이션 기준색 */
  hex: string;
}

const SENSOR: Record<SensorMetricKey, MetricChrome> = {
  es01: { bg: "bg-orange-50", border: "border-orange-200", hex: "#ea580c" },
  es02: { bg: "bg-cyan-50", border: "border-cyan-200", hex: "#0891b2" },
  es03: { bg: "bg-violet-50", border: "border-violet-200", hex: "#7c3aed" },
  es04: { bg: "bg-pink-50", border: "border-pink-200", hex: "#db2777" },
  es09: { bg: "bg-indigo-50", border: "border-indigo-200", hex: "#4f46e5" },
};

const MOTOR: Record<MotorMetricKey, MetricChrome> = {
  ec01: { bg: "bg-blue-50", border: "border-blue-200", hex: "#2563eb" },
  ec02: { bg: "bg-amber-50", border: "border-amber-200", hex: "#d97706" },
  ec03: { bg: "bg-teal-50", border: "border-teal-200", hex: "#0d9488" },
};

const FALLBACK: MetricChrome = {
  bg: "bg-slate-50",
  border: "border-slate-200",
  hex: "#64748b",
};

export function getSensorMetricStyle(key: string): MetricChrome {
  const k = key.toLowerCase() as SensorMetricKey;
  return SENSOR[k] ?? FALLBACK;
}

export function getMotorMetricStyle(key: string): MetricChrome {
  const k = key.toLowerCase() as MotorMetricKey;
  return MOTOR[k] ?? FALLBACK;
}

/** Recharts 등 센서 시리즈용 */
export function getSensorChartHex(key: SensorMetricKey): string {
  return SENSOR[key].hex;
}

/** Recharts 등 모터 시리즈용 */
export function getMotorChartHex(key: MotorMetricKey): string {
  return MOTOR[key].hex;
}

/** 임계값이 있을 때 값만 상태색 텍스트 클래스 */
export function getSensorValueTextClass(
  rawMax: number,
  thresholds: { warn: number; danger: number } | undefined
): string {
  if (!thresholds) return "text-gray-800";
  if (rawMax >= thresholds.danger) return "text-red-700";
  if (rawMax >= thresholds.warn) return "text-yellow-700";
  return "text-green-700";
}
