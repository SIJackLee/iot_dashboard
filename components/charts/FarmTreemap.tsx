// FarmTreemap 컴포넌트 - 농장 계층 구조 트리맵

"use client";

import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FarmSummaryDTO } from "@/types/dto";

interface FarmTreemapProps {
  farms: FarmSummaryDTO[];
  onFarmClick?: (registNo: string) => void;
}

export default function FarmTreemap({ farms, onFarmClick }: FarmTreemapProps) {
  // 트리맵 데이터 준비
  const treemapData = farms.map((farm) => {
    const total = farm.normal + farm.warn + farm.danger + farm.offline;
    
    // 상태 결정
    let state: "normal" | "warn" | "danger" | "offline" = "normal";
    if (farm.offline > 0) state = "offline";
    else if (farm.danger > 0) state = "danger";
    else if (farm.warn > 0) state = "warn";

    // 색상 결정
    const colors: Record<string, string> = {
      normal: "#22c55e",
      warn: "#eab308",
      danger: "#ef4444",
      offline: "#9ca3af",
    };

    return {
      name: farm.registNo,
      size: total || 1, // 크기는 방 수 기준
      fill: colors[state],
      state,
      normal: farm.normal,
      warn: farm.warn,
      danger: farm.danger,
      offline: farm.offline,
    };
  });

  if (treemapData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>농장 트리맵</CardTitle>
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
        <CardTitle>농장 트리맵 (크기: 방 수, 색상: 상태)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              onClick={(data: { name?: string } | undefined) => {
                if (data?.name && onFarmClick) {
                  onFarmClick(data.name);
                }
              }}
            >
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border rounded shadow px-3 py-2 text-sm">
                        <div className="font-semibold">{data.name}</div>
                        <div>정상: {data.normal}</div>
                        <div>경고: {data.warn}</div>
                        <div>위험: {data.danger}</div>
                        <div>오프라인: {data.offline}</div>
                        <div>총 방: {data.size}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {treemapData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  style={{ cursor: onFarmClick ? "pointer" : "default" }}
                />
              ))}
            </Treemap>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          {[
            { label: "정상", color: "#22c55e" },
            { label: "경고", color: "#eab308" },
            { label: "위험", color: "#ef4444" },
            { label: "오프라인", color: "#9ca3af" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
