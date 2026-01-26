// MotorsPanel 컴포넌트

"use client";

import type { MotorsDTO } from "@/types/dto";
import {
  motorLabel,
  ventModeLabel,
  VENT_MODE_LABEL,
  ACTIVE_VENT_LABEL,
} from "@/lib/labels";

interface MotorsPanelProps {
  motors: MotorsDTO;
}

export default function MotorsPanel({ motors }: MotorsPanelProps) {
  const getMaxValue = (arr: number[] | null): number => {
    if (!arr || arr.length === 0) return 0;
    return Math.max(...arr);
  };

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">모터 데이터</h3>
      
      {/* 모바일: 카드 레이아웃 */}
      <div className="sm:hidden space-y-2">
        <div className="bg-white rounded-lg border p-3 mb-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{VENT_MODE_LABEL}:</span>
            <span className="text-blue-600 font-semibold text-sm">{ventModeLabel(motors.ventMode)}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{motorLabel("ec01")}</span>
            <span className="text-green-600 text-xs">활성</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">최대값</span>
            <span className="font-semibold text-base">{getMaxValue(motors.ec01)}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{motorLabel("ec02")}</span>
            <span className={`text-xs ${motors.ventMode === "exhaust" ? "text-green-600" : "text-gray-400"}`}>
              {motors.ventMode === "exhaust" ? "활성" : "비활성"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">최대값</span>
            <span className="font-semibold text-base">{motors.ec02 ? getMaxValue(motors.ec02) : "-"}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{motorLabel("ec03")}</span>
            <span className={`text-xs ${motors.ventMode === "intake" ? "text-green-600" : "text-gray-400"}`}>
              {motors.ventMode === "intake" ? "활성" : "비활성"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">최대값</span>
            <span className="font-semibold text-base">{motors.ec03 ? getMaxValue(motors.ec03) : "-"}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{ACTIVE_VENT_LABEL}</span>
            <span className="text-blue-600 text-xs">활성</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">최대값</span>
            <span className="font-semibold text-base">{getMaxValue(motors.activeVent)}</span>
          </div>
        </div>
      </div>
      
      {/* PC: 테이블 레이아웃 */}
      <div className="hidden sm:block bg-gray-50 rounded-lg p-4">
        <div className="mb-2">
          <span className="font-medium">{VENT_MODE_LABEL}: </span>
          <span className="text-blue-600">{ventModeLabel(motors.ventMode)}</span>
        </div>
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">모터</th>
              <th className="text-left py-2 px-2">값 (배열)</th>
              <th className="text-left py-2 px-2">최대값</th>
              <th className="text-left py-2 px-2">상태</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-2 font-medium">{motorLabel("ec01")}</td>
              <td className="py-2 px-2 text-sm text-gray-600">
                [{motors.ec01.join(", ")}]
              </td>
              <td className="py-2 px-2 font-semibold">
                {getMaxValue(motors.ec01)}
              </td>
              <td className="py-2 px-2 text-green-600">활성</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-2 font-medium">{motorLabel("ec02")}</td>
              <td className="py-2 px-2 text-sm text-gray-600">
                {motors.ec02 ? `[${motors.ec02.join(", ")}]` : "null"}
              </td>
              <td className="py-2 px-2 font-semibold">
                {motors.ec02 ? getMaxValue(motors.ec02) : "-"}
              </td>
              <td className="py-2 px-2">
                {motors.ventMode === "exhaust" ? (
                  <span className="text-green-600">활성</span>
                ) : (
                  <span className="text-gray-400">비활성</span>
                )}
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-2 font-medium">{motorLabel("ec03")}</td>
              <td className="py-2 px-2 text-sm text-gray-600">
                {motors.ec03 ? `[${motors.ec03.join(", ")}]` : "null"}
              </td>
              <td className="py-2 px-2 font-semibold">
                {motors.ec03 ? getMaxValue(motors.ec03) : "-"}
              </td>
              <td className="py-2 px-2">
                {motors.ventMode === "intake" ? (
                  <span className="text-green-600">활성</span>
                ) : (
                  <span className="text-gray-400">비활성</span>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-2 font-medium">{ACTIVE_VENT_LABEL}</td>
              <td className="py-2 px-2 text-sm text-gray-600">
                [{motors.activeVent.join(", ")}]
              </td>
              <td className="py-2 px-2 font-semibold">
                {getMaxValue(motors.activeVent)}
              </td>
              <td className="py-2 px-2 text-blue-600">활성</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
