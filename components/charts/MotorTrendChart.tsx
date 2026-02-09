// MotorTrendChart 컴포넌트 - 모터 트렌드 차트 (입기/배기 정책 해제, ec01/ec02/ec03 모두 표시)

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";

const MAX_BLOWER = 4;
const MAX_VENT = 6;

type MotorKey = "ec01" | "ec02" | "ec03";

interface MotorTrendChartProps {
  logs: RoomLogPointDTO[];
  height?: number;
  showTitle?: boolean;
}

const MOTOR_COLORS: Record<MotorKey, string> = {
  ec01: "#ff7300",
  ec02: "#60a5fa",
  ec03: "#34d399",
};

export default function MotorTrendChart({
  logs,
  height = 260,
  showTitle = true,
}: MotorTrendChartProps) {
  const unit = getMotorUnit("ec01");
  const isMobile = typeof window !== "undefined"
    && window.matchMedia("(max-width: 639px)").matches;

  const ec01MaxLen = Math.max(0, ...logs.map((l) => (l.motors.ec01 ?? []).length));
  const ec02MaxLen = Math.max(0, ...logs.map((l) => (l.motors.ec02 ?? []).length));
  const ec03MaxLen = Math.max(0, ...logs.map((l) => (l.motors.ec03 ?? []).length));
  const blowerSlotCount = Math.min(ec01MaxLen, MAX_BLOWER);
  const ec02SlotCount = Math.min(ec02MaxLen, MAX_VENT);
  const ec03SlotCount = Math.min(ec03MaxLen, MAX_VENT);

  const blowerKeys = Array.from({ length: blowerSlotCount }, (_, i) => `b${i + 1}`);
  const ec02Keys = Array.from({ length: ec02SlotCount }, (_, i) => `e${i + 1}`);
  const ec03Keys = Array.from({ length: ec03SlotCount }, (_, i) => `i${i + 1}`);

  if (blowerSlotCount === 0 && ec02SlotCount === 0 && ec03SlotCount === 0) return null;

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () =>
      isMobile
        ? new Set([
            ...blowerKeys.slice(1),
            ...ec02Keys.slice(1),
            ...ec03Keys.slice(1),
          ])
        : new Set()
  );

  const chartData = logs
    .map((log) => {
      const ec01Values = log.motors.ec01 ?? [];
      const ec02Values = log.motors.ec02 ?? [];
      const ec03Values = log.motors.ec03 ?? [];
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
      ec02Keys.forEach((key, idx) => {
        const raw = ec02Values[idx];
        row[key] = raw != null ? convertMotorValue("ec02", raw) : null;
      });
      ec03Keys.forEach((key, idx) => {
        const raw = ec03Values[idx];
        row[key] = raw != null ? convertMotorValue("ec03", raw) : null;
      });
      return row;
    })
    .reverse();

  const ToggleGroup = ({
    keys,
    motorKey,
    label,
  }: {
    keys: string[];
    motorKey: MotorKey;
    label: string;
  }) => {
    if (keys.length === 0) return null;
    const allHidden = keys.every((k) => hiddenKeys.has(k));
    return (
      <>
        <button
          type="button"
          onClick={() =>
            setHiddenKeys((prev) => {
              const next = new Set(prev);
              keys.forEach((key) => (allHidden ? next.delete(key) : next.add(key)));
              return next;
            })
          }
          className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
            allHidden ? "opacity-40" : ""
          }`}
          title={`${label} 전체 ${allHidden ? "표시" : "숨김"}`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: MOTOR_COLORS[motorKey] }}
          />
          {label} 전체
        </button>
        {keys.map((key, index) => {
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
              title={`${label} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MOTOR_COLORS[motorKey] }}
              />
              {label} {index + 1}
            </button>
          );
        })}
      </>
    );
  };

  const getLabel = (dataKey: string) => {
    if (dataKey.startsWith("b")) {
      return `${motorLabel("ec01")} ${dataKey.slice(1)}`;
    }
    if (dataKey.startsWith("e")) {
      return `${motorLabel("ec02")} ${dataKey.slice(1)}`;
    }
    return `${motorLabel("ec03")} ${dataKey.slice(1)}`;
  };

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="flex justify-between text-sm font-semibold mb-3">
          <span>모터 트렌드</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <ToggleGroup keys={blowerKeys} motorKey="ec01" label={motorLabel("ec01")} />
        <ToggleGroup keys={ec02Keys} motorKey="ec02" label={motorLabel("ec02")} />
        <ToggleGroup keys={ec03Keys} motorKey="ec03" label={motorLabel("ec03")} />
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
              formatter={(value, name) => [
                `${Number(value).toLocaleString()} ${unit}`,
                getLabel(String(name)),
              ]}
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
            {ec02Keys.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={MOTOR_COLORS.ec02}
                  strokeOpacity={1 - index * 0.12}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            )}
            {ec03Keys.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={MOTOR_COLORS.ec03}
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
