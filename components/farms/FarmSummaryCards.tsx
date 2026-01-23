// FarmSummaryCards 컴포넌트 (모바일용 카드 뷰)

"use client";

import type { FarmSummaryDTO } from "@/types/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FreshnessBadge from "@/components/common/FreshnessBadge";

interface FarmSummaryCardsProps {
  items: FarmSummaryDTO[];
  onSelect?: (registNo: string) => void;
  highlightRegistNos?: Set<string>;
}

export default function FarmSummaryCards({
  items,
  onSelect,
  highlightRegistNos,
}: FarmSummaryCardsProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const state: "normal" | "warn" | "danger" | "offline" =
          item.offline > 0
            ? "offline"
            : item.danger > 0
            ? "danger"
            : item.warn > 0
            ? "warn"
            : "normal";

        return (
          <Card
            key={item.registNo}
            className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 ${
              highlightRegistNos?.has(item.registNo)
                ? "ring-2 ring-yellow-200 animate-pulse"
                : ""
            }`}
            onClick={() => onSelect?.(item.registNo)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(item.registNo);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`농장 ${item.registNo} 상세 보기`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span
                      className={
                        state === "normal"
                          ? "h-2 w-2 rounded-full bg-green-500"
                          : state === "warn"
                          ? "h-2 w-2 rounded-full bg-yellow-500"
                          : state === "danger"
                          ? "h-2 w-2 rounded-full bg-red-500"
                          : "h-2 w-2 rounded-full bg-gray-400"
                      }
                    />
                    {item.registNo}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    총 방 {item.totalRooms}개
                  </div>
                </div>
                <FreshnessBadge freshnessSec={item.freshnessSec} state={state} />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-green-700">정상: {item.normal}</div>
                <div className="text-yellow-700">경고: {item.warn}</div>
                <div className="text-red-700">위험: {item.danger}</div>
                <div className="text-gray-700">오프라인: {item.offline}</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={state === "danger" ? "destructive" : "outline"}
                  className={
                    state === "normal"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : state === "warn"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : state === "offline"
                      ? "bg-gray-200 text-gray-800 border-gray-300"
                      : ""
                  }
                >
                  {state.toUpperCase()}
                </Badge>
                <div className="text-xs text-gray-500">
                  {item.lastUpdatedAtKst
                    ? new Date(item.lastUpdatedAtKst).toLocaleString("ko-KR")
                    : "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
