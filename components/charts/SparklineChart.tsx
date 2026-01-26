// SparklineChart 컴포넌트 - 미니 트렌드 차트

"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  showTooltip?: boolean;
}

export default function SparklineChart({
  data,
  color = "#3b82f6",
  height = 30,
  showTooltip = false,
}: SparklineChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 text-xs"
        style={{ height }}
      >
        -
      </div>
    );
  }

  // 데이터를 차트 형식으로 변환
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border rounded shadow px-2 py-1 text-xs">
                      {payload[0].value?.toLocaleString()}
                    </div>
                  );
                }
                return null;
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
