// FarmOverviewHeader 컴포넌트 - 마지막 갱신/제목/요약/도넛 통합

"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

interface PieItem {
  id?: string;
  name: string;
  value: number;
  color: string;
}

interface FarmOverviewHeaderProps {
  lastUpdatedAtKst: string | null;
  title: string;
  totalRooms: number;
  normalRate: number;
  offlineRate: number;
  farmCount: number;
  statusPieData: PieItem[];
  statusFilter: string[];
  onStatusSelect: (id: string) => void;
}

const StatusPieChart = dynamic(() => import("@/components/charts/StatusPieChart"), {
  ssr: false,
  loading: () => <div className="h-[260px] min-h-[260px] w-full" />,
});

export default function FarmOverviewHeader({
  lastUpdatedAtKst,
  title,
  totalRooms,
  normalRate,
  offlineRate,
  farmCount,
  statusPieData,
  statusFilter,
  onStatusSelect,
}: FarmOverviewHeaderProps) {
  const formatRate = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-4 mb-6">
      <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-white/95 backdrop-blur border-b">
        <div className="text-xs text-muted-foreground">
          마지막 갱신:{" "}
          {lastUpdatedAtKst
            ? new Date(lastUpdatedAtKst).toLocaleString("ko-KR")
            : "N/A"}
        </div>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card className="bg-white rounded-lg shadow-sm border p-4">
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
      <StatusPieChart
        title="상태 분포"
        data={statusPieData}
        selectedIds={statusFilter}
        onSelect={onStatusSelect}
      />
    </div>
  );
}
