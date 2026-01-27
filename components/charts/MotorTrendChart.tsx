// MotorTrendChart 컴포넌트 - 모터 트렌드 차트

"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertMotorValue, getMotorUnit, motorLabel } from "@/lib/labels";

type VentMode = "exhaust" | "intake";

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

  const chartData = useMemo(
    () =>
      logs
        .map((log) => {
          const maxEc01 = log.motors.ec01.length > 0 ? Math.max(...log.motors.ec01) : 0;
          const secondaryValues = log.motors[secondaryKey] ?? [];
          const maxSecondary = secondaryValues.length > 0 ? Math.max(...secondaryValues) : 0;
          return {
            time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            EC01: convertMotorValue("ec01", maxEc01),
            SECONDARY: convertMotorValue(secondaryKey, maxSecondary),
          };
        })
        .reverse(),
    [logs, secondaryKey]
  );

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="text-sm font-semibold mb-3">모터 트렌드</div>
      )}
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
                const label = name === "EC01" ? motorLabel("ec01") : secondaryLabel;
                return [`${Number(value).toLocaleString()} ${unit}`, label];
              }}
            />
            <Line type="monotone" dataKey="EC01" stroke={MOTOR_COLORS.ec01} />
            <Line type="monotone" dataKey="SECONDARY" stroke={MOTOR_COLORS[secondaryKey]} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
