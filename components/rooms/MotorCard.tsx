"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
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
  /** API 기준 오프라인일 때 RPM·가동 배지·스파크라인 숨김 */
  isOffline?: boolean;
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
  isOffline = false,
}: MotorCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [headerScale, setHeaderScale] = useState(1);

  const unit = getMotorUnit(motorKey);

  const currentAvgRaw = useMemo(() => avg(values), [values]);
  const displayValue = currentAvgRaw == null ? null : convertMotorValue(motorKey, currentAvgRaw);

  const running = !isOffline && (currentAvgRaw ?? 0) > 0;
  const stateLabel = isOffline ? "오프라인" : running ? "가동" : "정지";

  const tone = useMemo(() => {
    if (isOffline || !running) {
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
  }, [running, motorKey, isOffline]);

  const sparkStrokeWidth = running ? 1.5 : 1.2;
  const sparkStrokeOpacity = running ? 0.55 : 0.38;
  const gradientTopOpacity = running ? 0.28 : 0.18;
  const gradientBottomOpacity = running ? 0.05 : 0.03;

  // 헤더 글자 크기 자동 축소(가로 폭이 줄면 줄바꿈 대신 폰트 사이즈를 줄임)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const baseValuePx = 44;
    const minValuePx = 28;
    const minScale = minValuePx / baseValuePx;
    const targetWidth = 420; // 데스크탑 기준(필요 시 380/320로 조정)

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      if (w <= 0) return;
      const next = Math.max(minScale, Math.min(1, w / targetWidth));
      setHeaderScale(next);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const labelPx = 34 * headerScale;
  const valuePx = 44 * headerScale;
  const unitPx = 28 * headerScale;

  const trendDirection = useMemo(() => {
    if (isOffline) return "stable";
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
  }, [history, isOffline]);

  const sparklineData = useMemo(() => {
    if (isOffline) return null;
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
  }, [history, isOffline]);

  const sparklinePath = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return "";
    return sparklineData.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [sparklineData]);

  const hasValue = !isOffline && displayValue != null;
  const hasHistory = Boolean(
    !isOffline && showSparkline && sparklineData && sparklineData.length >= 2
  );

  const gradientId = `motor-grad-${motorKey}`;

  const ariaLabel =
    onClick != null
      ? isOffline
        ? `${motorLabel(motorKey)} 오프라인, RPM 미표시`
        : `${motorLabel(motorKey)} ${stateLabel}, ${hasValue ? `${displayValue!.toFixed(0)} ${unit}` : "-"}`
      : undefined;

  return (
    <div
      className={`rounded-lg border p-3 shadow-sm transition-all min-h-[7.25rem] flex flex-col ${tone.bg} ${tone.border} ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
          : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      ref={cardRef}
    >
      <div className="flex items-center justify-between mb-2 flex-nowrap whitespace-nowrap">
        <div className="flex items-center gap-1 min-w-0 whitespace-nowrap">
          <span
            className="text-[34px] leading-none font-medium text-gray-700 whitespace-nowrap"
            style={{ fontSize: labelPx }}
          >
            {motorLabel(motorKey)}
          </span>
          <Badge
            variant="outline"
            className={
              isOffline
                ? "text-gray-700 border-gray-300 bg-gray-100 text-[34px] leading-none px-2 py-0.5 whitespace-nowrap"
                : running
                  ? "text-green-700 border-green-300 bg-green-50 text-[34px] leading-none px-2 py-0.5 whitespace-nowrap"
                  : "text-gray-700 border-gray-300 bg-gray-50 text-[34px] leading-none px-2 py-0.5 whitespace-nowrap"
            }
            style={{ fontSize: labelPx }}
          >
            {stateLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 min-w-0 flex-none whitespace-nowrap">
          {!isOffline && trendDirection !== "stable" && (
            <span
              className={`text-[34px] leading-none whitespace-nowrap ${
                trendDirection === "up" ? "text-red-500" : "text-blue-500"
              }`}
              style={{ fontSize: labelPx }}
            >
              {trendDirection === "up" ? "▲" : "▼"}
            </span>
          )}
          {isOffline ? (
            <span
              className="text-[44px] font-semibold text-gray-400 tabular-nums leading-none whitespace-nowrap"
              style={{ fontSize: valuePx }}
            >
              --
            </span>
          ) : hasValue ? (
            <span className="inline-flex items-baseline gap-x-0.5 whitespace-nowrap">
              <span
                className="text-[44px] font-bold tabular-nums text-gray-900 leading-none whitespace-nowrap"
                style={{ fontSize: valuePx }}
              >
                {displayValue!.toFixed(0)}
              </span>
              <span
                className="text-[28px] font-normal text-gray-500 leading-none whitespace-nowrap"
                style={{ fontSize: unitPx }}
              >
                {unit}
              </span>
            </span>
          ) : (
            <span
              className="text-[44px] font-medium text-gray-500 leading-none whitespace-nowrap"
              style={{ fontSize: valuePx }}
            >
              -
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto min-h-24 flex-1 flex flex-col justify-end">
        {hasHistory && sparklineData ? (
          <div className="h-24 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={tone.fillHex}
                    stopOpacity={gradientTopOpacity}
                  />
                  <stop
                    offset="100%"
                    stopColor={tone.fillHex}
                    stopOpacity={gradientBottomOpacity}
                  />
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
                strokeWidth={sparkStrokeWidth}
                strokeOpacity={sparkStrokeOpacity}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={sparklineData[sparklineData.length - 1].x}
                cy={sparklineData[sparklineData.length - 1].y}
                r={running ? 3.2 : 2.6}
                fill={tone.spark}
                vectorEffect="non-scaling-stroke"
                opacity={sparkStrokeOpacity}
              />
            </svg>
          </div>
        ) : (
          <div className="text-xs text-gray-500 min-h-24 flex items-end">
            {isOffline
              ? "수신 끊김 · RPM 미표시"
              : showSparkline
                ? "추세 데이터 없음"
                : "추세 숨김"}
          </div>
        )}
      </div>
    </div>
  );
}
