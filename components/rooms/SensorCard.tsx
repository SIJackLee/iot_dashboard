// SensorCard - 센서 데이터 카드 (이름, 값, 임계값 색상, 미니 스파크라인)

"use client";

import { useMemo } from "react";
import { sensorLabel, convertSensorValue, getSensorUnit } from "@/lib/labels";

// 센서별 임계값 (stateRules.ts와 동일)
const SENSOR_THRESHOLDS: Record<string, { warn: number; danger: number }> = {
  es01: { warn: 280, danger: 320 }, // 온도 28.0C / 32.0C
  es02: { warn: 650, danger: 750 }, // 습도 65% / 75%
  es03: { warn: 2300, danger: 2600 }, // CO2 ppm
  es04: { warn: 230, danger: 280 }, // NH3 23ppm / 28ppm (x10)
  es09: { warn: 380, danger: 450 }, // 음압 38Pa / 45Pa (x10)
};

interface SensorCardProps {
  sensorKey: string;
  values: number[];
  history?: number[]; // 스파크라인용 최근 값 배열
  showSparkline?: boolean;
  onClick?: () => void;
}

export default function SensorCard({
  sensorKey,
  values,
  history = [],
  showSparkline = true,
  onClick,
}: SensorCardProps) {
  const unit = getSensorUnit(sensorKey);
  const thresholds = SENSOR_THRESHOLDS[sensorKey.toLowerCase()];

  // 현재 최대값 계산
  const currentMax = useMemo(() => {
    const valid = values.filter((v) => v != null && !isNaN(v));
    return valid.length > 0 ? Math.max(...valid) : 0;
  }, [values]);

  const displayValue = convertSensorValue(sensorKey, currentMax);

  // 상태 색상 결정
  const getStateColor = (rawValue: number) => {
    if (!thresholds) return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
    if (rawValue >= thresholds.danger) {
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" };
    }
    if (rawValue >= thresholds.warn) {
      return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" };
    }
    return { bg: "bg-green-50", text: "text-green-700", border: "border-green-300" };
  };

  const stateColor = getStateColor(currentMax);

  // 트렌드 방향 계산
  const trendDirection = useMemo(() => {
    const data = history.length > 0 ? history : values;
    if (data.length < 2) return "stable";
    const recent = data.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const diff = last - first;
    const threshold = Math.abs(first) * 0.05; // 5% 변화 기준
    if (diff > threshold) return "up";
    if (diff < -threshold) return "down";
    return "stable";
  }, [history, values]);

  // 스파크라인 데이터 준비
  const sparklineData = useMemo(() => {
    const data = history.length > 0 ? history : values;
    if (data.length < 2) return null;
    
    const points = data.slice(-20); // 최근 20개 포인트
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    
    return points.map((v, i) => ({
      x: (i / (points.length - 1)) * 100,
      y: 100 - ((v - min) / range) * 100,
      value: v,
    }));
  }, [history, values]);

  // SVG 경로 생성
  const sparklinePath = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return "";
    return sparklineData
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [sparklineData]);

  // 스파크라인 색상
  const getSparklineColor = () => {
    if (!thresholds) return "#6b7280";
    if (currentMax >= thresholds.danger) return "#ef4444";
    if (currentMax >= thresholds.warn) return "#eab308";
    return "#22c55e";
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${stateColor.bg} ${stateColor.border} ${
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
      {/* Header: 센서 이름과 현재 값 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {sensorLabel(sensorKey)}
        </span>
        <div className="flex items-center gap-1.5">
          {/* Trend Arrow */}
          {trendDirection !== "stable" && (
            <span
              className={`text-xs ${
                trendDirection === "up" ? "text-red-500" : "text-blue-500"
              }`}
            >
              {trendDirection === "up" ? "▲" : "▼"}
            </span>
          )}
          <span className={`text-lg font-bold ${stateColor.text}`}>
            {displayValue.toFixed(1)}
            <span className="text-xs font-normal ml-0.5">{unit}</span>
          </span>
        </div>
      </div>

      {/* Mini Sparkline */}
      {showSparkline && sparklineData && sparklineData.length >= 2 && (
        <div className="h-12 w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Gradient fill under the line */}
            <defs>
              <linearGradient id={`gradient-${sensorKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getSparklineColor()} stopOpacity="0.3" />
                <stop offset="100%" stopColor={getSparklineColor()} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d={`${sparklinePath} L 100 100 L 0 100 Z`}
              fill={`url(#gradient-${sensorKey})`}
            />
            
            {/* Line */}
            <path
              d={sparklinePath}
              fill="none"
              stroke={getSparklineColor()}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Current point */}
            <circle
              cx={sparklineData[sparklineData.length - 1].x}
              cy={sparklineData[sparklineData.length - 1].y}
              r="3"
              fill={getSparklineColor()}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
