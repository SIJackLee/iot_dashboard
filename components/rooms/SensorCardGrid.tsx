// SensorCardGrid - 센서 카드 그리드 레이아웃

"use client";

import type { SensorsDTO, RoomLogPointDTO } from "@/types/dto";
import SensorCard from "./SensorCard";

interface SensorCardGridProps {
  sensors: SensorsDTO;
  logs?: RoomLogPointDTO[]; // 스파크라인용 로그 데이터
  onSelectSensor?: (sensorKey: keyof SensorsDTO) => void;
}

const SENSOR_THRESHOLDS: Record<string, { warn: number; danger: number }> = {
  es01: { warn: 280, danger: 320 }, // 온도 28.0C / 32.0C
  es02: { warn: 650, danger: 750 }, // 습도 65% / 75%
  es03: { warn: 2300, danger: 2600 }, // CO2 ppm
  es04: { warn: 230, danger: 280 }, // NH3 23ppm / 28ppm (x10)
  es09: { warn: 380, danger: 450 }, // 음압 38Pa / 45Pa (x10)
};

export default function SensorCardGrid({
  sensors,
  logs = [],
  onSelectSensor,
}: SensorCardGridProps) {
  const sensorKeys: Array<keyof SensorsDTO> = ["es01", "es02", "es03", "es04", "es09"];

  // 로그에서 각 센서별 히스토리 추출
  const getHistory = (key: keyof SensorsDTO): number[] => {
    if (logs.length === 0) return [];
    return logs
      .map((log) => {
        const values = log.sensors[key];
        if (!values || values.length === 0) return null;
        // 최대값 사용
        return Math.max(...values.filter((v) => v != null && !isNaN(v)));
      })
      .filter((v): v is number => v !== null);
  };

  // 값이 있는 센서만 표시
  const activeSensors = sensorKeys.filter((key) => {
    const values = sensors[key];
    if (!values || !Array.isArray(values) || values.length === 0) return false;
    return values.some((v) => v != null && !isNaN(v));
  });

  const getSeverityRank = (key: keyof SensorsDTO): number => {
    const thresholds = SENSOR_THRESHOLDS[String(key).toLowerCase()];
    const values = sensors[key] as number[];
    const valid = values.filter((v) => v != null && !isNaN(v));
    const maxValue = valid.length > 0 ? Math.max(...valid) : 0;

    if (!thresholds) return 2; // unknown => normal-ish
    if (maxValue >= thresholds.danger) return 0; // danger first
    if (maxValue >= thresholds.warn) return 1; // then warn
    return 2;
  };

  const sortedSensors = [...activeSensors].sort((a, b) => {
    const ra = getSeverityRank(a);
    const rb = getSeverityRank(b);
    if (ra !== rb) return ra - rb;
    return String(a).localeCompare(String(b));
  });

  if (activeSensors.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        센서 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {sortedSensors.map((key) => (
        <SensorCard
          key={key}
          sensorKey={key}
          values={sensors[key]}
          history={getHistory(key)}
          showSparkline={logs.length > 0}
          onClick={onSelectSensor ? () => onSelectSensor(key) : undefined}
        />
      ))}
    </div>
  );
}
