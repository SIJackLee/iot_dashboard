// SensorTrendChart 컴포넌트 - 단일 센서 트렌드 차트

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertSensorValue, getSensorUnit, sensorLabel } from "@/lib/labels";

type SensorKey = "es01" | "es02" | "es03" | "es04" | "es09";

const MAX_SLOTS = 6;

interface SensorTrendChartProps {
  logs: RoomLogPointDTO[];
  sensorKey: SensorKey;
  height?: number;
  showTitle?: boolean;
}

const SENSOR_COLORS: Record<SensorKey, string> = {
  es01: "#8884d8",
  es02: "#82ca9d",
  es03: "#ffc658",
  es04: "#ef4444",
  es09: "#60a5fa",
};

export default function SensorTrendChart({
  logs,
  sensorKey,
  height = 220,
  showTitle = true,
}: SensorTrendChartProps) {
  const unit = getSensorUnit(sensorKey);
  const color = SENSOR_COLORS[sensorKey];
  const isMobile = typeof window !== "undefined"
    && window.matchMedia("(max-width: 639px)").matches;

  // 실제 데이터가 존재하는 슬롯 수
  const slotCount = Math.min(
    Math.max(0, ...logs.map((log) => (log.sensors[sensorKey] ?? []).length)),
    MAX_SLOTS
  );
  // 테이블에 해당 센서 데이터가 없으면 렌더링하지 않음
  if (slotCount === 0) return null;
  const lineKeys = Array.from({ length: slotCount }, (_, i) => `v${i + 1}`);
  const lineOpacities = [1, 0.9, 0.8, 0.7, 0.6, 0.5];

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () => (isMobile ? new Set(lineKeys.slice(2)) : new Set())
  );

  const chartData = logs
    .map((log) => {
      const values = (log.sensors[sensorKey] ?? []) as number[];
      const row: Record<string, string | number | null> = {
        time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      lineKeys.forEach((key, idx) => {
        const raw = values[idx];
        row[key] = raw != null ? convertSensorValue(sensorKey, raw) : null;
      });
      return row;
    })
    .reverse();

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="text-sm font-semibold mb-3">{sensorLabel(sensorKey)}</div>
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
              title={`${sensorLabel(sensorKey)} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="w-full" style={{ height, minHeight: height }}>
        <ResponsiveContainer
          width="100%"
          height={height}
          minHeight={180}
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
                `${sensorLabel(sensorKey)} ${name}`,
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
