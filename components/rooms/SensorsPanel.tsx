// SensorsPanel 컴포넌트

"use client";

import type { SensorsDTO } from "@/types/dto";
import { sensorLabel } from "@/lib/labels";

interface SensorsPanelProps {
  sensors: SensorsDTO;
}

export default function SensorsPanel({ sensors }: SensorsPanelProps) {
  const sensorKeys: Array<keyof SensorsDTO> = ["es01", "es02", "es03", "es04", "es09"];

  const getMaxValue = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    return Math.max(...arr);
  };

  const getStats = (arr: number[]) => {
    if (arr.length === 0) return { max: 0, min: 0, avg: 0 };
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const avg = Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
    return { max, min, avg };
  };

  const getValueColor = (value: number) => {
    if (value >= 900) return "text-red-600 bg-red-50 border-red-200";
    if (value >= 700) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">센서 데이터</h3>
      
      {/* 모바일: 카드 레이아웃 */}
      <div className="sm:hidden space-y-2">
        {sensorKeys.map((key) => {
          const values = sensors[key] as number[];
          const stats = getStats(values);
          return (
            <div key={key} className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{sensorLabel(key)}</span>
                <span
                  className={`font-semibold text-base ${
                    stats.max >= 900
                      ? "text-red-600"
                      : stats.max >= 700
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {stats.max}
                </span>
              </div>
              
              {/* 통계 요약 */}
              <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-xs text-gray-500">최대</div>
                  <div className="font-semibold text-sm text-red-600">{stats.max}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">최소</div>
                  <div className="font-semibold text-sm text-blue-600">{stats.min}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">평균</div>
                  <div className="font-semibold text-sm text-green-600">{stats.avg}</div>
                </div>
              </div>
              
              {/* 배열 값 배지 */}
              <div className="grid grid-cols-2 gap-1.5">
                {values.map((val, idx) => (
                  <div
                    key={idx}
                    className={`rounded px-2 py-1 text-xs border ${getValueColor(val)}`}
                  >
                    <span className="text-gray-500">#{idx + 1}</span>
                    <span className="ml-1 font-semibold">{val}</span>
                  </div>
                ))}
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
              const stats = getStats(values);
              return (
                <tr key={key} className="border-b">
                  <td className="py-2 px-2 font-medium">{sensorLabel(key)}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      {values.map((val, idx) => (
                        <span
                          key={idx}
                          className={`rounded px-2 py-0.5 text-xs border ${getValueColor(val)}`}
                        >
                          #{idx + 1}: {val}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`font-semibold ${
                        stats.max >= 900
                          ? "text-red-600"
                          : stats.max >= 700
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {stats.max}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-blue-600">{stats.min}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-green-600">{stats.avg}</span>
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
