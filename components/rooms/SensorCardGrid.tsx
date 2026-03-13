// SensorCardGrid - 센서 카드 그리드 레이아웃

"use client";

import type { SensorsDTO, RoomLogPointDTO } from "@/types/dto";
import SensorCard from "./SensorCard";

interface SensorCardGridProps {
  sensors: SensorsDTO;
  logs?: RoomLogPointDTO[]; // 스파크라인용 로그 데이터
}

export default function SensorCardGrid({ sensors, logs = [] }: SensorCardGridProps) {
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

  if (activeSensors.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        센서 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      {activeSensors.map((key) => (
        <SensorCard
          key={key}
          sensorKey={key}
          values={sensors[key]}
          history={getHistory(key)}
          showSparkline={logs.length > 0}
        />
      ))}
    </div>
  );
}
