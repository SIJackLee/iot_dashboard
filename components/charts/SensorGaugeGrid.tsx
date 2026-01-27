// SensorGaugeGrid 컴포넌트 - 여러 센서를 게이지 그리드로 표시

"use client";

import type { SensorsDTO } from "@/types/dto";
import SensorGaugeChart from "./SensorGaugeChart";

interface SensorGaugeGridProps {
  sensors: SensorsDTO;
}

// 센서별 임계값 (stateRules.ts와 동일)
const SENSOR_THRESHOLDS: Record<
  string,
  { warn: number; danger: number; warnLow: number; dangerLow: number }
> = {
  es01: { warn: 280, danger: 320, warnLow: 200, dangerLow: 150 }, // 온도 28.0C / 32.0C / 20.0C / 15.0C
  es02: { warn: 650, danger: 750, warnLow: 450, dangerLow: 350 }, // 습도 65% / 75% / 45% / 35%
  es03: { warn: 2300, danger: 2600, warnLow: 800, dangerLow: 600 }, // CO2 ppm
  es04: { warn: 230, danger: 280, warnLow: 120, dangerLow: 80 }, // NH3 23ppm / 28ppm / 12ppm / 8ppm (x10)
  es09: { warn: 380, danger: 450, warnLow: 200, dangerLow: 120 }, // 음압 38Pa / 45Pa / 20Pa / 12Pa (x10)
};

export default function SensorGaugeGrid({ sensors }: SensorGaugeGridProps) {
  const sensorKeys: Array<keyof SensorsDTO> = ["es01", "es02", "es03", "es04", "es09"];

  const getMaxValue = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    return Math.max(...arr);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {sensorKeys.map((key) => {
        const values = sensors[key] as number[];
        const maxValue = getMaxValue(values);
        const thresholds = SENSOR_THRESHOLDS[key.toLowerCase()];
        
        if (!thresholds || values.length === 0) {
          return null;
        }

        return (
          <SensorGaugeChart
            key={key}
            sensorKey={key}
            value={maxValue}
            thresholds={thresholds}
          />
        );
      })}
    </div>
  );
}
