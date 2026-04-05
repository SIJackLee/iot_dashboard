"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";
import { getMotorChartHex, type MotorMetricKey } from "@/lib/metricColors";

type MotorKey = MotorMetricKey;

const MAX_SLOTS = 6;

interface MotorSingleTrendChartProps {
  logs: RoomLogPointDTO[];
  motorKey: MotorKey;
  height?: number;
  showTitle?: boolean;
}

export default function MotorSingleTrendChart({
  logs,
  motorKey,
  height = 320,
  showTitle = true,
}: MotorSingleTrendChartProps) {
  const unit = getMotorUnit(motorKey);
  const color = getMotorChartHex(motorKey);
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 639px)").matches;

  const getValues = (log: RoomLogPointDTO): number[] => {
    const motors = log.motors;
    const raw =
      motorKey === "ec01"
        ? motors.ec01
        : motorKey === "ec02"
        ? motors.ec02
        : motors.ec03;
    return Array.isArray(raw) ? raw : [];
  };

  const slotCount = Math.min(
    Math.max(0, ...logs.map((log) => getValues(log).length)),
    MAX_SLOTS
  );
  const lineKeys = Array.from({ length: slotCount }, (_, i) => `v${i + 1}`);
  const lineOpacities = [1, 0.9, 0.8, 0.7, 0.6, 0.5];

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () => (isMobile ? new Set(lineKeys.slice(2)) : new Set())
  );

  if (slotCount === 0) return null;

  const chartData = logs
    .map((log) => {
      const values = getValues(log);
      const row: Record<string, string | number | null> = {
        time: new Date(log.measureTsKst).toLocaleString("ko-KR", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      lineKeys.forEach((key, idx) => {
        const raw = values[idx];
        row[key] = raw != null ? convertMotorValue(motorKey, raw) : null;
      });
      return row;
    })
    .reverse();

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="text-sm font-semibold mb-3">{motorLabel(motorKey)}</div>
      )}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {lineKeys.map((key, index) => {
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
              title={`${motorLabel(motorKey)} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {index + 1}
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
            <XAxis
              dataKey="time"
              interval="preserveStartEnd"
              minTickGap={28}
              tick={{ fontSize: 10 }}
              angle={-32}
              textAnchor="end"
              height={56}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toLocaleString()} ${unit}`,
                `${motorLabel(motorKey)} ${name}`,
              ]}
            />
            {lineKeys.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={`${index + 1}`}
                  stroke={color}
                  strokeOpacity={lineOpacities[index] ?? 0.5}
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

