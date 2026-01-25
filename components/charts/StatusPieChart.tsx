// StatusPieChart 컴포넌트 - 상태 분포 Pie 차트

"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PieItem {
  id?: string;
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  title: string;
  data: PieItem[];
  selectedIds?: string[];
  onSelect?: (id: string) => void;
}

export default function StatusPieChart({
  title,
  data,
  selectedIds,
  onSelect,
}: StatusPieChartProps) {
  const hasData = data.some((d) => d.value > 0);
  const hasSelection = selectedIds && selectedIds.length > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[260px] min-h-[260px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={2}
                  onClick={(entry) => {
                    if (!onSelect) return;
                    const id = (entry as PieItem).id ?? (entry as PieItem).name;
                    onSelect(id);
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={
                        hasSelection &&
                        selectedIds?.includes(entry.id ?? entry.name)
                          ? "#111827"
                          : "none"
                      }
                      strokeWidth={
                        hasSelection &&
                        selectedIds?.includes(entry.id ?? entry.name)
                          ? 2
                          : 0
                      }
                      opacity={
                        hasSelection &&
                        !selectedIds?.includes(entry.id ?? entry.name)
                          ? 0.4
                          : 1
                      }
                      cursor={onSelect ? "pointer" : "default"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            표시할 데이터가 없습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
