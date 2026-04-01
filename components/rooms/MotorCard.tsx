"use client";

import { useMemo } from "react";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";

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

  const tone = useMemo(() => {
    const running = (currentAvgRaw ?? 0) > 0;
    if (!running) {
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        spark: "#6b7280",
      };
    }
    if (motorKey === "ec01") {
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        spark: "#3b82f6",
      };
    }
    if (motorKey === "ec02") {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        spark: "#f59e0b",
      };
    }
    return {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      spark: "#22c55e",
    };
  }, [currentAvgRaw, motorKey]);

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

  return (
    <div
      className={`rounded-lg border p-3 shadow-sm transition-all ${tone.bg} ${tone.border} ${
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
          <span className={`text-lg font-bold tabular-nums ${tone.text}`}>
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

      {hasHistory && (
        <div className="h-12 w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path
              d={sparklinePath}
              fill="none"
              stroke={tone.spark}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {!hasHistory && (
        <div className="text-xs text-gray-500">
          {showSparkline ? "추세 데이터 없음" : "추세 숨김"}
        </div>
      )}
    </div>
  );
}

