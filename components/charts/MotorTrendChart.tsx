// MotorTrendChart 컴포넌트 - 모터 트렌드 차트

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";

type VentMode = "exhaust" | "intake";

const MAX_BLOWER = 4;
const MAX_SECONDARY = 6;

interface MotorTrendChartProps {
  logs: RoomLogPointDTO[];
  ventMode: VentMode;
  height?: number;
  showTitle?: boolean;
}

const MOTOR_COLORS = {
  ec01: "#ff7300",
  ec02: "#60a5fa",
  ec03: "#34d399",
};

export default function MotorTrendChart({
  logs,
  ventMode,
  height = 260,
  showTitle = true,
}: MotorTrendChartProps) {
  const secondaryKey = ventMode === "intake" ? "ec03" : "ec02";
  const secondaryLabel = motorLabel(secondaryKey);
  const unit = getMotorUnit("ec01");
  const isMobile = typeof window !== "undefined"
    && window.matchMedia("(max-width: 639px)").matches;

  // 실제 데이터가 존재하는 슬롯 수 계산 (ec01, ec02, ec03)
  const ec01MaxLen = Math.max(0, ...logs.map((l) => (l.motors.ec01 ?? []).length));
  const ec02MaxLen = Math.max(0, ...logs.map((l) => (l.motors.ec02 ?? []).length));
  const ec03MaxLen = Math.max(0, ...logs.map((l) => (l.motors.ec03 ?? []).length));
  const blowerSlotCount = Math.min(ec01MaxLen, MAX_BLOWER);
  const secondarySlotCount = Math.min(
    secondaryKey === "ec02" ? ec02MaxLen : ec03MaxLen,
    MAX_SECONDARY
  );

  const blowerKeys = Array.from({ length: blowerSlotCount }, (_, i) => `b${i + 1}`);
  const secondaryKeys = Array.from({ length: secondarySlotCount }, (_, i) => `s${i + 1}`);

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () =>
      isMobile
        ? new Set([...blowerKeys.slice(1), ...secondaryKeys.slice(1)])
        : new Set()
  );

  const chartData = logs
    .map((log) => {
      const ec01Values = log.motors.ec01 ?? [];
      const secondaryValues = log.motors[secondaryKey] ?? [];
      const row: Record<string, string | number | null> = {
        time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      blowerKeys.forEach((key, idx) => {
        const raw = ec01Values[idx];
        row[key] = raw != null ? convertMotorValue("ec01", raw) : null;
      });
      secondaryKeys.forEach((key, idx) => {
        const raw = secondaryValues[idx];
        row[key] = raw != null ? convertMotorValue(secondaryKey, raw) : null;
      });
      return row;
    })
    .reverse();

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="flex items-center justify-between text-sm font-semibold mb-3">
          <span>모터 트렌드</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {blowerSlotCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setHiddenKeys((prev) => {
                const allHidden = blowerKeys.every((key) => prev.has(key));
                const next = new Set(prev);
                blowerKeys.forEach((key) => {
                  if (allHidden) next.delete(key);
                  else next.add(key);
                });
                return next;
              })
            }
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
              blowerKeys.every((key) => hiddenKeys.has(key)) ? "opacity-40" : ""
            }`}
            title={`송풍 전체 ${blowerKeys.every((key) => hiddenKeys.has(key)) ? "표시" : "숨김"}`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: MOTOR_COLORS.ec01 }}
            />
            송풍 전체
          </button>
        )}
        {secondarySlotCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setHiddenKeys((prev) => {
                const allHidden = secondaryKeys.every((key) => prev.has(key));
                const next = new Set(prev);
                secondaryKeys.forEach((key) => {
                  if (allHidden) next.delete(key);
                  else next.add(key);
                });
                return next;
              })
            }
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
              secondaryKeys.every((key) => hiddenKeys.has(key)) ? "opacity-40" : ""
            }`}
            title={`${secondaryLabel} 전체 ${
              secondaryKeys.every((key) => hiddenKeys.has(key)) ? "표시" : "숨김"
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: MOTOR_COLORS[secondaryKey] }}
            />
            {secondaryLabel} 전체
          </button>
        )}
        {blowerKeys.map((key, index) => {
          const hidden = hiddenKeys.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setHiddenKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                })
              }
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
                hidden ? "opacity-40" : ""
              }`}
              title={`${motorLabel("ec01")} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MOTOR_COLORS.ec01 }}
              />
              송풍 {index + 1}
            </button>
          );
        })}
        {secondaryKeys.map((key, index) => {
          const hidden = hiddenKeys.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setHiddenKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                })
              }
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
                hidden ? "opacity-40" : ""
              }`}
              title={`${secondaryLabel} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MOTOR_COLORS[secondaryKey] }}
              />
              {secondaryLabel} {index + 1}
            </button>
          );
        })}
      </div>
      <div className="w-full" style={{ height, minHeight: height }}>
        <ResponsiveContainer
          width="100%"
          height={height}
          minHeight={200}
          minWidth={200}
          debounce={50}
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                const label =
                  String(name).startsWith("b")
                    ? `${motorLabel("ec01")} ${String(name).slice(1)}`
                    : `${secondaryLabel} ${String(name).slice(1)}`;
                return [`${Number(value).toLocaleString()} ${unit}`, label];
              }}
            />
            {blowerKeys.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={MOTOR_COLORS.ec01}
                  strokeOpacity={1 - index * 0.15}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            )}
            {secondaryKeys.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={MOTOR_COLORS[secondaryKey]}
                  strokeOpacity={1 - index * 0.12}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
