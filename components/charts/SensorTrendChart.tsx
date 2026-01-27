// SensorTrendChart 컴포넌트 - 단일 센서 트렌드 차트

"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertSensorValue, getSensorUnit, sensorLabel } from "@/lib/labels";

type SensorKey = "es01" | "es02" | "es03" | "es04" | "es09";

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

  const chartData = useMemo(
    () =>
      logs
        .map((log) => {
          const values = log.sensors[sensorKey] ?? [];
          const maxValue = values.length > 0 ? Math.max(...values) : 0;
          return {
            time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            value: convertSensorValue(sensorKey, maxValue),
          };
        })
        .reverse(),
    [logs, sensorKey]
  );

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="text-sm font-semibold mb-3">{sensorLabel(sensorKey)}</div>
      )}
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
              formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`, sensorLabel(sensorKey)]}
            />
            <Line type="monotone" dataKey="value" stroke={color} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
