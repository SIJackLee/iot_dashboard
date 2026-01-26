// FarmHeatmap 컴포넌트 - 농장별 상태 히트맵

"use client";

import { AlertTriangle, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { FarmSummaryDTO } from "@/types/dto";

interface FarmHeatmapProps {
  farms?: FarmSummaryDTO[];
  onFarmClick?: (registNo: string) => void;
  isLoading?: boolean;
  error?: string;
  compact?: boolean;
}

export default function FarmHeatmap({
  farms,
  onFarmClick,
  isLoading = false,
  error,
  compact = false,
}: FarmHeatmapProps) {
  const safeFarms = farms ?? [];
  const isEmpty = safeFarms.length === 0;

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

  // 그리드 레이아웃 (타일 크기 축소를 위해 컬럼 수 증가)
  const gridCols = Math.ceil(Math.sqrt(Math.max(safeFarms.length, 1)) * (compact ? 2.0 : 1.8));

  const totals = safeFarms.reduce(
    (acc, farm) => {
      acc.normal += farm.normal;
      acc.warn += farm.warn;
      acc.danger += farm.danger;
      acc.offline += farm.offline;
      return acc;
    },
    { normal: 0, warn: 0, danger: 0, offline: 0 }
  );

  const cardHeightClass = compact ? "h-[320px]" : "h-[360px]";
  const tileTextClass = compact ? "text-[9px]" : "text-[10px]";

  return (
    <Card className={`${cardHeightClass} flex flex-col`}>
      <CardHeader>
        <CardTitle>농장 상태 히트맵</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        {isLoading ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <LoadingSpinner message="히트맵을 불러오는 중..." size="sm" />
          </div>
        ) : error ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <EmptyState
              title="히트맵을 표시할 수 없습니다"
              description={error}
              icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        ) : isEmpty ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <EmptyState
              title="표시할 농장이 없습니다"
              description="현재 조건에서 표시할 농장 데이터가 없습니다."
              icon={<Inbox className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        ) : (
        <div className="flex-1 min-h-0 overflow-auto">
          <div
            className="grid gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {safeFarms.map((farm) => {
              const intensity = getIntensity(farm);
              const stateColor = getStateColor(farm);
              const stateLabel =
                farm.offline > 0
                  ? "오프라인"
                  : farm.danger > 0
                  ? "위험"
                  : farm.warn > 0
                  ? "경고"
                  : "정상";
              
              return (
                <div
                  key={farm.registNo}
                  onClick={() => onFarmClick?.(farm.registNo)}
                  className={`
                    ${stateColor}
                    cursor-pointer
                    aspect-square
                    rounded-sm
                    flex items-center justify-center
                    text-white ${tileTextClass} font-medium
                    hover:opacity-80
                    transition-opacity
                    border border-gray-300
                  `}
                  style={{
                    opacity: Math.max(0.3, intensity / 100),
                  }}
                  title={`${farm.registNo} (${stateLabel}): 정상 ${farm.normal}, 경고 ${farm.warn}, 위험 ${farm.danger}, 오프라인 ${farm.offline}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`농장 ${farm.registNo} 상세 보기`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onFarmClick?.(farm.registNo);
                    }
                  }}
                >
                  <span className="truncate px-0.5">{farm.registNo}</span>
                </div>
              );
            })}
          </div>
        </div>
        )}
        {!isLoading && !error && !isEmpty && (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span>정상 {totals.normal}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span>경고 {totals.warn}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span>위험 {totals.danger}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-400 rounded" />
              <span>오프라인 {totals.offline}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
