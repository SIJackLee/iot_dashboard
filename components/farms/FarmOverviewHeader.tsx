// FarmOverviewHeader 컴포넌트 - 마지막 갱신/제목/요약/도넛/히트맵 통합

"use client";

import { Card } from "@/components/ui/card";
import type { FarmSummaryDTO } from "@/types/dto";

interface FarmOverviewHeaderProps {
  lastUpdatedAtKst: string | null;
  title: string;
  totalRooms: number;
  normalRate: number;
  offlineRate: number;
  farmCount: number;
}

export default function FarmOverviewHeader({
  lastUpdatedAtKst,
  title,
  totalRooms,
  normalRate,
  offlineRate,
  farmCount,
}: FarmOverviewHeaderProps) {
  const formatRate = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
      
      {/* 모바일: 핵심 정보만 (정상률, 위험/오프라인 수) */}
      <Card className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 sm:hidden">
        <div className="text-xs text-muted-foreground mb-2 text-left">핵심 요약</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <div className="text-muted-foreground text-xs text-left mb-1">정상률</div>
            <div className="text-base font-semibold text-green-600 text-right">
              {formatRate(normalRate)}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-muted-foreground text-xs text-left mb-1">오프라인율</div>
            <div className="text-base font-semibold text-right">
              <span className="text-gray-600">{formatRate(offlineRate)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* PC: 전체 요약 */}
      <Card className="bg-white rounded-lg shadow-sm border p-4 hidden sm:block">
        <div className="text-sm text-muted-foreground mb-2">전체 요약</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">전체 방</div>
            <div className="text-lg font-semibold">{totalRooms}</div>
          </div>
          <div>
            <div className="text-muted-foreground">정상률</div>
            <div className="text-lg font-semibold text-green-600">
              {formatRate(normalRate)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">오프라인율</div>
            <div className="text-lg font-semibold text-gray-600">
              {formatRate(offlineRate)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">농장 수</div>
            <div className="text-lg font-semibold">{farmCount}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
