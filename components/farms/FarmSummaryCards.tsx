// FarmSummaryCards 컴포넌트 (모바일용 카드 뷰)

"use client";

import { memo } from "react";
import type { FarmSummaryDTO } from "@/types/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FarmSummaryCardsProps {
  items: FarmSummaryDTO[];
  onSelect?: (registNo: string) => void;
  highlightRegistNos?: Set<string>;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  density?: "compact" | "detail";
}

const FarmSummaryCards = memo(function FarmSummaryCards({
  items,
  onSelect,
  highlightRegistNos,
  columns = 1,
  density = "compact",
}: FarmSummaryCardsProps) {
  const gridColsClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-3"
        : columns === 4
          ? "sm:grid-cols-4"
          : columns === 5
            ? "sm:grid-cols-5"
            : columns === 6
              ? "sm:grid-cols-6"
              : "sm:grid-cols-1";

  return (
    <div
      className={
        columns === 1
          ? "space-y-2 sm:space-y-3"
          : `grid grid-cols-1 ${gridColsClass} gap-2 sm:gap-3`
      }
    >
      {items.map((item) => {
        const state: "normal" | "warn" | "danger" | "offline" =
          item.offline > 0
            ? "offline"
            : item.danger > 0
            ? "danger"
            : item.warn > 0
            ? "warn"
            : "normal";
        const isAllOffline =
          item.totalRooms > 0 && item.offline >= item.totalRooms;
        const showDangerInCompact = !isAllOffline || item.danger > 0;
        const showOfflineCountLine = density === "detail" || !isAllOffline;

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
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <span
                      className={
                        state === "normal"
                          ? "h-2 w-2 rounded-full bg-green-500 flex-shrink-0"
                          : state === "warn"
                          ? "h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0"
                          : state === "danger"
                          ? "h-2 w-2 rounded-full bg-red-500 flex-shrink-0"
                          : "h-2 w-2 rounded-full bg-gray-400 flex-shrink-0"
                      }
                    />
                    <span className="truncate">{item.registNo}</span>
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
                  </CardTitle>
                  {density === "detail" && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      총 방 {item.totalRooms}개
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground p-4 pt-0">
              {/* 모바일: 핵심 정보만 (위험/오프라인 수) */}
              <div className="sm:hidden space-y-2">
                {(density === "detail" || showDangerInCompact) && (
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 font-medium text-left">위험:</span>
                    <span className="text-red-700 font-semibold text-right">
                      {item.danger}
                    </span>
                  </div>
                )}
                {showOfflineCountLine && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium text-left">
                      오프라인:
                    </span>
                    <span className="text-gray-700 font-semibold text-right">
                      {item.offline}
                    </span>
                  </div>
                )}
              </div>
              
              {/* PC: 전체 정보 */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-2 gap-2">
                  {(density === "detail" || showDangerInCompact) && (
                    <div className="text-red-700">위험: {item.danger}</div>
                  )}
                  {showOfflineCountLine && (
                    <div className="text-gray-700">오프라인: {item.offline}</div>
                  )}
                  {density === "detail" && (
                    <>
                      <div className="text-yellow-700">경고: {item.warn}</div>
                      <div className="text-green-700">정상: {item.normal}</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

export default FarmSummaryCards;
