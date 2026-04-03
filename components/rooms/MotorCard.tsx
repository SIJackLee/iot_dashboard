"use client";

import { useMemo } from "react";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";
import { getMotorMetricStyle } from "@/lib/metricColors";

type MotorKey = "ec01" | "ec02" | "ec03";

interface MotorCardProps {
  motorKey: MotorKey;
  values: number[];
  history?: number[];
  showSparkline?: boolean;
  /** 추후 확장용 (이번 단계에서는 미사용) */
  maxRpm?: number;
  onClick?: () => void;
}

function avg(values: number[]): number | null {
  const valid = values.filter((v) => v != null && !Number.isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export default function MotorCard({
  motorKey,
  values,
  history = [],
  showSparkline = true,
  onClick,
}: MotorCardProps) {
  const unit = getMotorUnit(motorKey);

  const currentAvgRaw = useMemo(() => avg(values), [values]);
  const displayValue = currentAvgRaw == null ? null : convertMotorValue(motorKey, currentAvgRaw);

  const running = (currentAvgRaw ?? 0) > 0;

  const tone = useMemo(() => {
    if (!running) {
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        spark: "#6b7280",
        fillHex: "#6b7280",
      };
    }
    const id = getMotorMetricStyle(motorKey);
    return {
      bg: id.bg,
      border: id.border,
      spark: id.hex,
      fillHex: id.hex,
    };
  }, [running, motorKey]);

  const trendDirection = useMemo(() => {
    const data = history.length > 0 ? history : [];
    if (data.length < 2) return "stable";
    const recent = data.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;
    const threshold = Math.abs(first) * 0.05;
    if (diff > threshold) return "up";
    if (diff < -threshold) return "down";
    return "stable";
  }, [history]);

  const sparklineData = useMemo(() => {
    const data = history.length > 0 ? history : [];
    if (data.length < 2) return null;
    const points = data.slice(-20);
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    return points.map((v, i) => ({
      x: (i / (points.length - 1)) * 100,
      y: 100 - ((v - min) / range) * 100,
    }));
  }, [history]);

  const sparklinePath = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return "";
    return sparklineData.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [sparklineData]);

  const hasValue = displayValue != null;
  const hasHistory = Boolean(showSparkline && sparklineData && sparklineData.length >= 2);

  const gradientId = `motor-grad-${motorKey}`;

  return (
    <div
      className={`rounded-lg border p-3 shadow-sm transition-all min-h-[7.25rem] flex flex-col ${tone.bg} ${tone.border} ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
          : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{motorLabel(motorKey)}</span>
        <div className="flex items-center gap-1.5">
          {trendDirection !== "stable" && (
            <span className={`text-xs ${trendDirection === "up" ? "text-red-500" : "text-blue-500"}`}>
              {trendDirection === "up" ? "▲" : "▼"}
            </span>
          )}
          <span className="text-lg font-bold tabular-nums text-gray-900">
            {hasValue ? (
              <>
                {displayValue!.toFixed(0)}
                <span className="text-xs font-normal ml-1 text-gray-500">{unit}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-500">-</span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-auto min-h-12 flex-1 flex flex-col justify-end">
        {hasHistory && sparklineData ? (
          <div className="h-12 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tone.fillHex} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={tone.fillHex} stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path
                d={`${sparklinePath} L 100 100 L 0 100 Z`}
                fill={`url(#${gradientId})`}
              />
              <path
                d={sparklinePath}
                fill="none"
                stroke={tone.spark}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={sparklineData[sparklineData.length - 1].x}
                cy={sparklineData[sparklineData.length - 1].y}
                r="3"
                fill={tone.spark}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        ) : (
          <div className="text-xs text-gray-500 min-h-12 flex items-end">
            {showSparkline ? "추세 데이터 없음" : "추세 숨김"}
          </div>
        )}
      </div>
    </div>
  );
}
