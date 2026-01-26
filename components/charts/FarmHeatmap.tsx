// FarmHeatmap 컴포넌트 - 농장별 상태 히트맵

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FarmSummaryDTO } from "@/types/dto";

interface FarmHeatmapProps {
  farms: FarmSummaryDTO[];
  onFarmClick?: (registNo: string) => void;
}

export default function FarmHeatmap({ farms, onFarmClick }: FarmHeatmapProps) {
  // 상태별 색상
  const getStateColor = (farm: FarmSummaryDTO) => {
    if (farm.offline > 0) return "bg-gray-400"; // 오프라인
    if (farm.danger > 0) return "bg-red-500"; // 위험
    if (farm.warn > 0) return "bg-yellow-500"; // 경고
    return "bg-green-500"; // 정상
  };

  // 상태별 강도 계산 (0-100%)
  const getIntensity = (farm: FarmSummaryDTO) => {
    const total = farm.normal + farm.warn + farm.danger + farm.offline;
    if (total === 0) return 0;
    
    if (farm.offline > 0) {
      return Math.min(100, (farm.offline / total) * 100);
    }
    if (farm.danger > 0) {
      return Math.min(100, 50 + (farm.danger / total) * 50);
    }
    if (farm.warn > 0) {
      return Math.min(100, 30 + (farm.warn / total) * 20);
    }
    return 20; // 정상은 낮은 강도
  };

  // 그리드 레이아웃 (10x10 또는 동적)
  const gridCols = Math.ceil(Math.sqrt(farms.length));
  const gridRows = Math.ceil(farms.length / gridCols);

  return (
    <Card>
      <CardHeader>
        <CardTitle>농장 상태 히트맵</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          {farms.map((farm) => {
            const intensity = getIntensity(farm);
            const stateColor = getStateColor(farm);
            
            return (
              <div
                key={farm.registNo}
                onClick={() => onFarmClick?.(farm.registNo)}
                className={`
                  ${stateColor}
                  cursor-pointer
                  aspect-square
                  rounded
                  flex items-center justify-center
                  text-white text-xs font-medium
                  hover:opacity-80
                  transition-opacity
                  border border-gray-300
                `}
                style={{
                  opacity: Math.max(0.3, intensity / 100),
                }}
                title={`${farm.registNo}: 정상 ${farm.normal}, 경고 ${farm.warn}, 위험 ${farm.danger}, 오프라인 ${farm.offline}`}
              >
                <span className="truncate px-1">{farm.registNo}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>정상</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>경고</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>위험</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-400 rounded" />
            <span>오프라인</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
