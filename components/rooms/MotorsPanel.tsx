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
      <h3 className="font-semibold mb-2">모터 데이터</h3>
      <div className="bg-gray-50 rounded-lg p-4">
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
