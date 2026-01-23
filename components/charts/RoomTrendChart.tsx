// RoomTrendChart 컴포넌트 (Recharts)

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { motorLabel, sensorLabel } from "@/lib/labels";

interface RoomTrendChartProps {
  logs: RoomLogPointDTO[];
  height?: number;
  showTitle?: boolean;
}

export default function RoomTrendChart({
  logs,
  height = 300,
  showTitle = true,
}: RoomTrendChartProps) {
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());
  // 로그 데이터를 차트 형식으로 변환
  const chartData = logs.map((log) => {
    const maxEs01 = log.sensors.es01.length > 0 ? Math.max(...log.sensors.es01) : 0;
    const maxEs02 = log.sensors.es02.length > 0 ? Math.max(...log.sensors.es02) : 0;
    const maxEs03 = log.sensors.es03.length > 0 ? Math.max(...log.sensors.es03) : 0;
    const maxEc01 = log.motors.ec01.length > 0 ? Math.max(...log.motors.ec01) : 0;

    return {
      time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ES01: maxEs01,
      ES02: maxEs02,
      ES03: maxEs03,
      EC01: maxEc01,
    };
  }).reverse(); // 시간순 정렬

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {showTitle && <h3 className="font-semibold mb-4">트렌드 차트</h3>}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        {[
          { key: "ES01", label: sensorLabel("es01"), color: "#8884d8" },
          { key: "ES02", label: sensorLabel("es02"), color: "#82ca9d" },
          { key: "ES03", label: sensorLabel("es03"), color: "#ffc658" },
          { key: "EC01", label: motorLabel("ec01"), color: "#ff7300" },
        ].map((item) => {
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
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          {!hiddenKeys.has("ES01") && (
            <Line type="monotone" dataKey="ES01" stroke="#8884d8" />
          )}
          {!hiddenKeys.has("ES02") && (
            <Line type="monotone" dataKey="ES02" stroke="#82ca9d" />
          )}
          {!hiddenKeys.has("ES03") && (
            <Line type="monotone" dataKey="ES03" stroke="#ffc658" />
          )}
          {!hiddenKeys.has("EC01") && (
            <Line type="monotone" dataKey="EC01" stroke="#ff7300" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
