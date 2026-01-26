// SensorsPanel 컴포넌트

"use client";

import type { SensorsDTO } from "@/types/dto";
import { sensorLabel, convertSensorValue, getSensorUnit } from "@/lib/labels";

interface SensorsPanelProps {
  sensors: SensorsDTO;
}

// 센서별 임계값 (stateRules.ts와 동일)
const SENSOR_THRESHOLDS: Record<string, { warn: number; danger: number }> = {
  es01: { warn: 280, danger: 320 }, // 온도 28.0C / 32.0C
  es02: { warn: 650, danger: 750 }, // 습도 65% / 75%
  es03: { warn: 2300, danger: 2600 }, // CO2 ppm
  es04: { warn: 230, danger: 280 }, // NH3 23ppm / 28ppm (x10)
  es09: { warn: 380, danger: 450 }, // 음압 38Pa / 45Pa (x10)
};

export default function SensorsPanel({ sensors }: SensorsPanelProps) {
  const sensorKeys: Array<keyof SensorsDTO> = ["es01", "es02", "es03", "es04", "es09"];

  const getStats = (arr: number[], key: string) => {
    if (arr.length === 0) return { max: 0, min: 0, avg: 0 };
    const converted = arr.map(v => convertSensorValue(key, v));
    const max = Math.max(...converted);
    const min = Math.min(...converted);
    const avg = Math.round((converted.reduce((a, b) => a + b, 0) / converted.length) * 10) / 10;
    return { max, min, avg };
  };

  const getValueColor = (value: number, sensorKey: string) => {
    // 센서별 임계값 사용 (원본 값 기준, x10 스케일)
    const thresholds = SENSOR_THRESHOLDS[sensorKey.toLowerCase()];
    if (!thresholds) {
      // 임계값이 없는 경우 기본값
      return "text-gray-600 bg-gray-50 border-gray-200";
    }
    
    if (value >= thresholds.danger) {
      return "text-red-600 bg-red-50 border-red-200";
    }
    if (value >= thresholds.warn) {
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getMaxValueColor = (value: number, sensorKey: string) => {
    // 최대값 색상 판정 (원본 값 기준, x10 스케일)
    const thresholds = SENSOR_THRESHOLDS[sensorKey.toLowerCase()];
    if (!thresholds) {
      return "text-gray-600";
    }
    
    if (value >= thresholds.danger) {
      return "text-red-600";
    }
    if (value >= thresholds.warn) {
      return "text-yellow-600";
    }
    return "text-green-600";
  };

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">센서 데이터</h3>
      
      {/* 모바일: 카드 레이아웃 */}
      <div className="sm:hidden space-y-2">
        {sensorKeys.map((key) => {
          const values = sensors[key] as number[];
          const stats = getStats(values, key);
          const unit = getSensorUnit(key);
          const maxOriginal = Math.max(...(values.length > 0 ? values : [0]));
          return (
            <div key={key} className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{sensorLabel(key)}</span>
                <span
                  className={`font-semibold text-base ${getMaxValueColor(maxOriginal, key)}`}
                >
                  {stats.max.toFixed(1)} {unit}
                </span>
              </div>
              
              {/* 통계 요약 */}
              <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-xs text-gray-500">최대</div>
                  <div className="font-semibold text-sm text-red-600">{stats.max.toFixed(1)} {unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">최소</div>
                  <div className="font-semibold text-sm text-blue-600">{stats.min.toFixed(1)} {unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">평균</div>
                  <div className="font-semibold text-sm text-green-600">{stats.avg.toFixed(1)} {unit}</div>
                </div>
              </div>
              
              {/* 배열 값 배지 */}
              <div className="grid grid-cols-2 gap-1.5">
                {values.map((val, idx) => {
                  const convertedVal = convertSensorValue(key, val);
                  return (
                    <div
                      key={idx}
                      className={`rounded px-2 py-1 text-xs border ${getValueColor(val, key)}`}
                    >
                      <span className="text-gray-500">#{idx + 1}</span>
                      <span className="ml-1 font-semibold">{convertedVal.toFixed(1)} {unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* PC: 테이블 레이아웃 */}
      <div className="hidden sm:block bg-gray-50 rounded-lg p-4">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">센서</th>
              <th className="text-left py-2 px-2">값 (배열)</th>
              <th className="text-left py-2 px-2">최대</th>
              <th className="text-left py-2 px-2">최소</th>
              <th className="text-left py-2 px-2">평균</th>
            </tr>
          </thead>
          <tbody>
            {sensorKeys.map((key) => {
              const values = sensors[key] as number[];
              const stats = getStats(values, key);
              const unit = getSensorUnit(key);
              const maxOriginal = Math.max(...(values.length > 0 ? values : [0]));
              return (
                <tr key={key} className="border-b">
                  <td className="py-2 px-2 font-medium">{sensorLabel(key)}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      {values.map((val, idx) => {
                        const convertedVal = convertSensorValue(key, val);
                        return (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-xs border ${getValueColor(val, key)}`}
                          >
                            #{idx + 1}: {convertedVal.toFixed(1)} {unit}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`font-semibold ${getMaxValueColor(maxOriginal, key)}`}
                    >
                      {stats.max.toFixed(1)} {unit}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-blue-600">{stats.min.toFixed(1)} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-green-600">{stats.avg.toFixed(1)} {unit}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
