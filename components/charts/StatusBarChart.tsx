// StatusBarChart 컴포넌트 - 상태 비교 막대 그래프

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FarmSummaryDTO } from "@/types/dto";

interface StatusBarChartProps {
  farms: FarmSummaryDTO[];
  maxItems?: number; // 표시할 최대 항목 수
  sortBy?: "total" | "danger" | "warn" | "offline";
}

export default function StatusBarChart({
  farms,
  maxItems = 20,
  sortBy = "danger",
}: StatusBarChartProps) {
  // 데이터 준비
  const chartData = farms
    .map((farm) => ({
      name: farm.registNo,
      정상: farm.normal,
      경고: farm.warn,
      위험: farm.danger,
      오프라인: farm.offline,
      total: farm.normal + farm.warn + farm.danger + farm.offline,
    }))
    .sort((a, b) => {
      switch (sortBy) {
        case "danger":
          return b.위험 - a.위험;
        case "warn":
          return b.경고 - a.경고;
        case "offline":
          return b.오프라인 - a.오프라인;
        default:
          return b.total - a.total;
      }
    })
    .slice(0, maxItems);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>농장 상태 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-10">
            표시할 데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>농장 상태 비교 (상위 {maxItems}개)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="정상" stackId="a" fill="#22c55e" />
              <Bar dataKey="경고" stackId="a" fill="#eab308" />
              <Bar dataKey="위험" stackId="a" fill="#ef4444" />
              <Bar dataKey="오프라인" stackId="a" fill="#9ca3af" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
