// SensorTrendChart 컴포넌트 - 단일 센서 트렌드 차트

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertSensorValue, getSensorUnit, sensorLabel } from "@/lib/labels";

type SensorKey = "es01" | "es02" | "es03" | "es04" | "es09";

const LINE_KEYS = ["v1", "v2", "v3", "v4"] as const;
const LINE_OPACITIES = [1, 0.8, 0.6, 0.4];

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
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () => (isMobile ? new Set(["v3", "v4"]) : new Set())
  );

  const chartData = logs
    .map((log) => {
      const values = log.sensors[sensorKey] ?? [];
      const valueSlots = LINE_KEYS.map((_, index) => {
        const raw = values[index];
        return raw == null ? null : convertSensorValue(sensorKey, raw);
      });
      return {
        time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        v1: valueSlots[0],
        v2: valueSlots[1],
        v3: valueSlots[2],
        v4: valueSlots[3],
      };
    })
    .reverse();

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="text-sm font-semibold mb-3">{sensorLabel(sensorKey)}</div>
      )}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {LINE_KEYS.map((key, index) => {
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
            {LINE_KEYS.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={`${index + 1}`}
                  stroke={color}
                  strokeOpacity={LINE_OPACITIES[index]}
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
