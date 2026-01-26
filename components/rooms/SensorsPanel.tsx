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

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">센서 데이터</h3>
      
      {/* 모바일: 카드 레이아웃 */}
      <div className="sm:hidden space-y-2">
        {sensorKeys.map((key) => {
          const values = sensors[key] as number[];
          const max = getMaxValue(values);
          return (
            <div key={key} className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{sensorLabel(key)}</span>
                <span
                  className={`font-semibold text-base ${
                    max >= 900
                      ? "text-red-600"
                      : max >= 700
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {max}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-left">
                값: [{values.join(", ")}]
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
              <th className="text-left py-2 px-2">최대값</th>
            </tr>
          </thead>
          <tbody>
            {sensorKeys.map((key) => {
              const values = sensors[key] as number[];
              const max = getMaxValue(values);
              return (
                <tr key={key} className="border-b">
                  <td className="py-2 px-2 font-medium">{sensorLabel(key)}</td>
                  <td className="py-2 px-2 text-sm text-gray-600">
                    [{values.join(", ")}]
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`font-semibold ${
                        max >= 900
                          ? "text-red-600"
                          : max >= 700
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {max}
                    </span>
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
