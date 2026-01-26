// MotorsPanel 컴포넌트

"use client";

import type { MotorsDTO } from "@/types/dto";
import {
  motorLabel,
  ventModeLabel,
  VENT_MODE_LABEL,
  ACTIVE_VENT_LABEL,
  getMotorUnit,
} from "@/lib/labels";

interface MotorsPanelProps {
  motors: MotorsDTO;
}

export default function MotorsPanel({ motors }: MotorsPanelProps) {
  const getMaxValue = (arr: number[] | null): number => {
    if (!arr || arr.length === 0) return 0;
    return Math.max(...arr);
  };

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
        
        {(() => {
          const ec01Stats = getStats(motors.ec01);
          const unit = getMotorUnit("ec01");
          return (
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{motorLabel("ec01")}</span>
                <span className="text-green-600 text-xs">활성</span>
              </div>
              
              {/* 통계 요약 */}
              <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-xs text-gray-500">최대</div>
                  <div className="font-semibold text-sm text-red-600">{ec01Stats.max} {unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">최소</div>
                  <div className="font-semibold text-sm text-blue-600">{ec01Stats.min} {unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">평균</div>
                  <div className="font-semibold text-sm text-green-600">{ec01Stats.avg} {unit}</div>
                </div>
              </div>
              
              {/* 배열 값 배지 */}
              <div className="grid grid-cols-2 gap-1.5">
                {motors.ec01.map((val, idx) => (
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
        })()}
        
        {(() => {
          const ec02Stats = motors.ec02 ? getStats(motors.ec02) : null;
          const unit = getMotorUnit("ec02");
          return (
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{motorLabel("ec02")}</span>
                <span className={`text-xs ${motors.ventMode === "exhaust" ? "text-green-600" : "text-gray-400"}`}>
                  {motors.ventMode === "exhaust" ? "활성" : "비활성"}
                </span>
              </div>
              {ec02Stats && motors.ec02 ? (
                <>
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">최대</div>
                      <div className="font-semibold text-sm text-red-600">{ec02Stats.max} {unit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">최소</div>
                      <div className="font-semibold text-sm text-blue-600">{ec02Stats.min} {unit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">평균</div>
                      <div className="font-semibold text-sm text-green-600">{ec02Stats.avg} {unit}</div>
                    </div>
                  </div>
                  
                  {/* 배열 값 배지 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {motors.ec02.map((val, idx) => (
                      <div
                        key={idx}
                        className={`rounded px-2 py-1 text-xs border ${getMotorValueColor(val)}`}
                      >
                        <span className="text-gray-500">#{idx + 1}</span>
                        <span className="ml-1 font-semibold">{val} {unit}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 text-center py-2">null</div>
              )}
            </div>
          );
        })()}
        
        {(() => {
          const ec03Stats = motors.ec03 ? getStats(motors.ec03) : null;
          const unit = getMotorUnit("ec03");
          return (
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{motorLabel("ec03")}</span>
                <span className={`text-xs ${motors.ventMode === "intake" ? "text-green-600" : "text-gray-400"}`}>
                  {motors.ventMode === "intake" ? "활성" : "비활성"}
                </span>
              </div>
              {ec03Stats && motors.ec03 ? (
                <>
                  {/* 통계 요약 */}
                  <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">최대</div>
                      <div className="font-semibold text-sm text-red-600">{ec03Stats.max} {unit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">최소</div>
                      <div className="font-semibold text-sm text-blue-600">{ec03Stats.min} {unit}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">평균</div>
                      <div className="font-semibold text-sm text-green-600">{ec03Stats.avg} {unit}</div>
                    </div>
                  </div>
                  
                  {/* 배열 값 배지 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {motors.ec03.map((val, idx) => (
                      <div
                        key={idx}
                        className={`rounded px-2 py-1 text-xs border ${getMotorValueColor(val)}`}
                      >
                        <span className="text-gray-500">#{idx + 1}</span>
                        <span className="ml-1 font-semibold">{val} {unit}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 text-center py-2">null</div>
              )}
            </div>
          );
        })()}
        
        {(() => {
          const activeVentStats = getStats(motors.activeVent);
          const unit = getMotorUnit("ec01"); // activeVent는 모터이므로 RPM 단위 사용
          return (
            <div className="bg-white rounded-lg border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{ACTIVE_VENT_LABEL}</span>
                <span className="text-blue-600 text-xs">활성</span>
              </div>
              
              {/* 통계 요약 */}
              <div className="grid grid-cols-3 gap-2 mb-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-xs text-gray-500">최대</div>
                  <div className="font-semibold text-sm text-red-600">{activeVentStats.max} {unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">최소</div>
                  <div className="font-semibold text-sm text-blue-600">{activeVentStats.min} {unit}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">평균</div>
                  <div className="font-semibold text-sm text-green-600">{activeVentStats.avg} {unit}</div>
                </div>
              </div>
              
              {/* 배열 값 배지 */}
              <div className="grid grid-cols-2 gap-1.5">
                {motors.activeVent.map((val, idx) => (
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
        })()}
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
              <th className="text-left py-2 px-2">최대</th>
              <th className="text-left py-2 px-2">최소</th>
              <th className="text-left py-2 px-2">평균</th>
              <th className="text-left py-2 px-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const ec01Stats = getStats(motors.ec01);
              const unit = getMotorUnit("ec01");
              return (
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">{motorLabel("ec01")}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      {motors.ec01.map((val, idx) => (
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
                    <span className="font-semibold text-red-600">{ec01Stats.max} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-blue-600">{ec01Stats.min} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-green-600">{ec01Stats.avg} {unit}</span>
                  </td>
                  <td className="py-2 px-2 text-green-600">활성</td>
                </tr>
              );
            })()}
            {(() => {
              const ec02Stats = motors.ec02 ? getStats(motors.ec02) : null;
              const unit = getMotorUnit("ec02");
              return (
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">{motorLabel("ec02")}</td>
                  <td className="py-2 px-2">
                    {ec02Stats && motors.ec02 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {motors.ec02.map((val, idx) => (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-xs border ${getMotorValueColor(val)}`}
                          >
                            #{idx + 1}: {val} {unit}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">null</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold">{ec02Stats ? `${ec02Stats.max} ${unit}` : "-"}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold">{ec02Stats ? `${ec02Stats.min} ${unit}` : "-"}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold">{ec02Stats ? `${ec02Stats.avg} ${unit}` : "-"}</span>
                  </td>
                  <td className="py-2 px-2">
                    {motors.ventMode === "exhaust" ? (
                      <span className="text-green-600">활성</span>
                    ) : (
                      <span className="text-gray-400">비활성</span>
                    )}
                  </td>
                </tr>
              );
            })()}
            {(() => {
              const ec03Stats = motors.ec03 ? getStats(motors.ec03) : null;
              const unit = getMotorUnit("ec03");
              return (
                <tr className="border-b">
                  <td className="py-2 px-2 font-medium">{motorLabel("ec03")}</td>
                  <td className="py-2 px-2">
                    {ec03Stats && motors.ec03 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {motors.ec03.map((val, idx) => (
                          <span
                            key={idx}
                            className={`rounded px-2 py-0.5 text-xs border ${getMotorValueColor(val)}`}
                          >
                            #{idx + 1}: {val} {unit}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">null</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold">{ec03Stats ? `${ec03Stats.max} ${unit}` : "-"}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold">{ec03Stats ? `${ec03Stats.min} ${unit}` : "-"}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold">{ec03Stats ? `${ec03Stats.avg} ${unit}` : "-"}</span>
                  </td>
                  <td className="py-2 px-2">
                    {motors.ventMode === "intake" ? (
                      <span className="text-green-600">활성</span>
                    ) : (
                      <span className="text-gray-400">비활성</span>
                    )}
                  </td>
                </tr>
              );
            })()}
            {(() => {
              const activeVentStats = getStats(motors.activeVent);
              const unit = getMotorUnit("ec01"); // activeVent는 모터이므로 RPM 단위 사용
              return (
                <tr>
                  <td className="py-2 px-2 font-medium">{ACTIVE_VENT_LABEL}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      {motors.activeVent.map((val, idx) => (
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
                    <span className="font-semibold text-red-600">{activeVentStats.max} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-blue-600">{activeVentStats.min} {unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-semibold text-green-600">{activeVentStats.avg} {unit}</span>
                  </td>
                  <td className="py-2 px-2 text-blue-600">활성</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
