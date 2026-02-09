// RoomTrendChart 컴포넌트 (Recharts)

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertMotorValue, convertSensorValue, getMotorUnit, getSensorUnit, motorLabel, sensorLabel } from "@/lib/labels";

interface RoomTrendChartProps {
  logs: RoomLogPointDTO[];
  height?: number;
  showTitle?: boolean;
}

// 데이터가 존재하는 시리즈만 반환 (최소 1개 로그에서 유효값 있음)
function getVisibleSeries(logs: RoomLogPointDTO[]) {
  const keys = ["ES01", "ES02", "ES03", "EC01"] as const;
  const sensorMap = { ES01: "es01", ES02: "es02", ES03: "es03" } as const;
  return keys.filter((key) => {
    const hasData = logs.some((log) => {
      if (key === "EC01") {
        const arr = log.motors.ec01 ?? [];
        return arr.length > 0 && arr.some((v) => v != null && !isNaN(v));
      }
      const arr = (log.sensors[sensorMap[key]] ?? []) as number[];
      return arr.length > 0 && arr.some((v) => v != null && !isNaN(v));
    });
    return hasData;
  });
}

export default function RoomTrendChart({
  logs,
  height = 300,
  showTitle = true,
}: RoomTrendChartProps) {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  const visibleSeries = getVisibleSeries(logs);

  const chartData = logs.map((log) => {
    const maxEs01 = (log.sensors.es01 ?? []).length > 0 ? Math.max(...(log.sensors.es01 ?? [])) : null;
    const maxEs02 = (log.sensors.es02 ?? []).length > 0 ? Math.max(...(log.sensors.es02 ?? [])) : null;
    const maxEs03 = (log.sensors.es03 ?? []).length > 0 ? Math.max(...(log.sensors.es03 ?? [])) : null;
    const maxEc01 = (log.motors.ec01 ?? []).length > 0 ? Math.max(...(log.motors.ec01 ?? [])) : null;

    const row: Record<string, string | number | null> = {
      time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    if (visibleSeries.includes("ES01")) row.ES01 = maxEs01 != null ? convertSensorValue("es01", maxEs01) : null;
    if (visibleSeries.includes("ES02")) row.ES02 = maxEs02 != null ? convertSensorValue("es02", maxEs02) : null;
    if (visibleSeries.includes("ES03")) row.ES03 = maxEs03 != null ? convertSensorValue("es03", maxEs03) : null;
    if (visibleSeries.includes("EC01")) row.EC01 = maxEc01 != null ? convertMotorValue("ec01", maxEc01) : null;
    return row;
  }).reverse();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {showTitle && <h3 className="font-semibold mb-4">트렌드 차트</h3>}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {[
          { key: "ES01", label: sensorLabel("es01"), color: "#8884d8" },
          { key: "ES02", label: sensorLabel("es02"), color: "#82ca9d" },
          { key: "ES03", label: sensorLabel("es03"), color: "#ffc658" },
          { key: "EC01", label: motorLabel("ec01"), color: "#ff7300" },
        ]
          .filter((item) => visibleSeries.includes(item.key))
          .map((item) => {
          const hidden = hiddenKeys.has(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setHiddenKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(item.key)) next.delete(item.key);
                  else next.add(item.key);
                  return next;
                })
              }
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
                hidden ? "opacity-40" : ""
              }`}
              title={`${item.label} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
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
                const unit =
                  name === "EC01" ? getMotorUnit("ec01") : getSensorUnit(String(name).toLowerCase());
                return [`${Number(value).toLocaleString()} ${unit}`, name];
              }}
            />
            {visibleSeries.includes("ES01") && !hiddenKeys.has("ES01") && (
              <Line type="monotone" dataKey="ES01" stroke="#8884d8" />
            )}
            {visibleSeries.includes("ES02") && !hiddenKeys.has("ES02") && (
              <Line type="monotone" dataKey="ES02" stroke="#82ca9d" />
            )}
            {visibleSeries.includes("ES03") && !hiddenKeys.has("ES03") && (
              <Line type="monotone" dataKey="ES03" stroke="#ffc658" />
            )}
            {visibleSeries.includes("EC01") && !hiddenKeys.has("EC01") && (
              <Line type="monotone" dataKey="EC01" stroke="#ff7300" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
