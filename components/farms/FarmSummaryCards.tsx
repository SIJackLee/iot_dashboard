// FarmSummaryCards 컴포넌트 (모바일용 카드 뷰)

"use client";

import { memo } from "react";
import type { FarmSummaryDTO } from "@/types/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FreshnessBadge from "@/components/common/FreshnessBadge";

interface FarmSummaryCardsProps {
  items: FarmSummaryDTO[];
  onSelect?: (registNo: string) => void;
  highlightRegistNos?: Set<string>;
}

const FarmSummaryCards = memo(function FarmSummaryCards({
  items,
  onSelect,
  highlightRegistNos,
}: FarmSummaryCardsProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
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
                  </CardTitle>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    총 방 {item.totalRooms}개
                  </div>
                </div>
                <FreshnessBadge freshnessSec={item.freshnessSec} state={state} />
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground p-4 pt-0">
              {/* 모바일: 핵심 정보만 (위험/오프라인 수) */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-medium text-left">위험:</span>
                  <span className="text-red-700 font-semibold text-right">{item.danger}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium text-left">오프라인:</span>
                  <span className="text-gray-700 font-semibold text-right">{item.offline}</span>
                </div>
                <div className="pt-2 border-t flex justify-center">
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
                    {state === "normal" ? "정상" : state === "warn" ? "경고" : state === "danger" ? "위험" : "오프라인"}
                  </Badge>
                </div>
              </div>
              
              {/* PC: 전체 정보 */}
              <div className="hidden sm:block">
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

export default FarmSummaryCards;
