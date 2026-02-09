// MotorsPanel 컴포넌트

"use client";

import type { MotorsDTO } from "@/types/dto";
import { motorLabel, getMotorUnit } from "@/lib/labels";

interface MotorsPanelProps {
  motors: MotorsDTO;
}

// 모터별 값 존재 여부
const hasMotorValues = (arr: number[] | null | undefined) =>
  arr != null && Array.isArray(arr) && arr.length > 0;

export default function MotorsPanel({ motors }: MotorsPanelProps) {
  const visibleMotors = [
    hasMotorValues(motors.ec01) && "ec01",
    hasMotorValues(motors.ec02) && "ec02",
    hasMotorValues(motors.ec03) && "ec03",
  ].filter(Boolean) as ("ec01" | "ec02" | "ec03")[];

  const getStats = (arr: number[] | null) => {
    if (!arr || arr.length === 0) return { max: 0, min: 0, avg: 0 };
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const avg = Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
    return { max, min, avg };
  };

  const getMotorValueColor = (value: number) => {
    // 모터 RPM 기준 (예: 0-500: 회색, 500-1000: 파랑, 1000+: 초록)
    if (value === 0) return "text-gray-400 bg-gray-50 border-gray-200";
    if (value < 500) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  if (visibleMotors.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">모터 데이터</h3>
      
      {/* 모바일: 카드 레이아웃 */}
      <div className="sm:hidden space-y-2">
        {visibleMotors.map((key) => {
          const arr = motors[key] ?? [];
          const stats = getStats(arr);
          const unit = getMotorUnit(key);
          return (
            <div key={key} className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{motorLabel(key)}</span>
              </div>
              
              {/* 통계 요약: 배열 길이 > 1일 때만 */}
              {arr.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">최대</div>
                    <div className="font-semibold text-sm text-red-600">{stats.max} {unit}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">최소</div>
                    <div className="font-semibold text-sm text-blue-600">{stats.min} {unit}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">평균</div>
                    <div className="font-semibold text-sm text-green-600">{stats.avg} {unit}</div>
                  </div>
                </div>
              )}
              
              {/* 배열 값 배지: 배열 길이만큼만 */}
              <div
                className="gap-1.5"
                style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(arr.length, 4)}, minmax(0, 1fr))` }}
              >
                {arr.map((val, idx) => (
                  <div
                    key={idx}
                    className={`rounded px-2 py-1 text-xs border ${getMotorValueColor(val)}`}
                  >
                    <span className="text-gray-500">#{idx + 1}</span>
                    <span className="ml-1 font-semibold">{val} {unit}</span>
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
              <th className="text-left py-2 px-2">모터</th>
              <th className="text-left py-2 px-2">값 (배열)</th>
              <th className="text-left py-2 px-2">최대</th>
              <th className="text-left py-2 px-2">최소</th>
              <th className="text-left py-2 px-2">평균</th>
            </tr>
          </thead>
          <tbody>
            {visibleMotors.map((key) => {
              const arr = motors[key] ?? [];
              const stats = getStats(arr);
              const unit = getMotorUnit(key);
              return (
                <tr key={key} className="border-b">
                  <td className="py-2 px-2 font-medium">{motorLabel(key)}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      {arr.map((val, idx) => (
                        <span
                          key={idx}
                          className={`rounded px-2 py-0.5 text-xs border ${getMotorValueColor(val)}`}
                        >
                          #{idx + 1}: {val} {unit}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-red-600">{stats.max} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-blue-600">{stats.min} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-green-600">{stats.avg} {unit}</span>
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
