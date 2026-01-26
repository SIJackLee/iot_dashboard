// AlertsTogglePanel 컴포넌트 - 현재/과거 토글 통합

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AlertsPanel from "@/components/farms/AlertsPanel";
import AlertsHistoryPanel from "@/components/farms/AlertsHistoryPanel";
import FarmSummaryFilters from "@/components/farms/FarmSummaryFilters";
import FarmSummaryTable from "@/components/farms/FarmSummaryTable";
import FarmSummaryCards from "@/components/farms/FarmSummaryCards";
import EmptyState from "@/components/common/EmptyState";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import type { RoomSnapshotLiteDTO, FarmSummaryDTO } from "@/types/dto";
import type { ReactNode } from "react";

type StatusKey = "normal" | "warn" | "danger" | "offline";

interface AlertsTogglePanelProps {
  registNo?: string;
  rooms?: RoomSnapshotLiteDTO[];
  onSelectRoom?: (key12: string) => void;
  stateFilter?: StatusKey[];
  statusMeta?: { id: StatusKey; label: string; count: number }[];
  onToggleStatus?: (id: string) => void;
  onSelectAllStatus?: () => void;
  onClearStatus?: () => void;
  debouncedSearch?: string;
  sortLabel?: Record<string, string>;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onResetFilters?: () => void;
  onSearchChange?: (value: string) => void;
  onSortChange?: (sortBy: string) => void;
  visibleColumns?: Record<string, boolean>;
  onToggleColumn?: (key: string) => void;
  defaultView?: "history" | "current";
  highlightKey12s?: Set<string>;
  farmItems?: FarmSummaryDTO[];
  onSelectFarm?: (registNo: string) => void;
  highlightRegistNos?: Set<string>;
  isEmpty?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: ReactNode;
  emptyStateActionLabel?: string;
  onEmptyStateAction?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  startIndex?: number;
  endIndex?: number;
  totalItems?: number;
}

export default function AlertsTogglePanel({
  registNo,
  rooms,
  onSelectRoom,
  stateFilter = [],
  statusMeta = [],
  onToggleStatus,
  onSelectAllStatus,
  onClearStatus,
  debouncedSearch,
  sortLabel,
  sortBy,
  sortDir,
  onResetFilters,
  onSearchChange,
  onSortChange,
  visibleColumns,
  onToggleColumn,
  defaultView = "history",
  highlightKey12s,
  farmItems,
  onSelectFarm,
  highlightRegistNos,
  isEmpty = false,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon,
  emptyStateActionLabel,
  onEmptyStateAction,
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: AlertsTogglePanelProps) {
  const [view, setView] = useState<"history" | "current">(defaultView);

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={view === "history" ? "default" : "outline"}
          onClick={() => setView("history")}
        >
          과거 이력
        </Button>
        <Button
          size="sm"
          variant={view === "current" ? "default" : "outline"}
          onClick={() => setView("current")}
        >
          현재 알림
        </Button>
      </div>

      {view === "current" && (
        <div className="space-y-3">
          {/* 모바일: 핵심 필터만 (위험/오프라인) */}
          <div className="sm:hidden flex flex-wrap items-center gap-2">
            {statusMeta
              .filter((s) => s.id === "danger" || s.id === "offline")
              .map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={stateFilter?.includes(s.id) ? "default" : "outline"}
                  onClick={() => onToggleStatus?.(s.id)}
                  className="text-xs"
                >
                  {s.label} {s.count > 0 && `(${s.count})`}
                </Button>
              ))}
            {onSearchChange && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // 검색 입력을 위한 간단한 처리 (추후 개선 가능)
                  const searchValue = prompt("농장 검색:");
                  if (searchValue !== null) {
                    onSearchChange(searchValue);
                  }
                }}
                className="text-xs"
              >
                검색
              </Button>
            )}
          </div>
          
          {/* PC: 전체 필터 */}
          {onSearchChange && onSortChange && (
            <div className="hidden sm:block">
              <FarmSummaryFilters
                onSearchChange={onSearchChange}
                onSortChange={onSortChange}
              />
            </div>
          )}
          {visibleColumns && onToggleColumn && (
            <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>컬럼 표시</span>
              {Object.entries(visibleColumns).map(([key, value]) => (
                <label key={key} className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => onToggleColumn(key)}
                  />
                  {key}
                </label>
              ))}
            </div>
          )}
          {isEmpty ? (
            <EmptyState
              title={emptyStateTitle || "표시할 농장이 없습니다"}
              description={emptyStateDescription || "현재 표시할 농장 데이터가 없습니다."}
              icon={emptyStateIcon}
              actionLabel={emptyStateActionLabel}
              onAction={onEmptyStateAction}
            />
          ) : (
            <>
              {farmItems && farmItems.length > 0 && (
                <>
                  {currentPage !== undefined &&
                    totalPages !== undefined &&
                    onPageChange &&
                    startIndex !== undefined &&
                    endIndex !== undefined &&
                    totalItems !== undefined && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                        <div className="text-xs text-muted-foreground">
                          {startIndex + 1}-{endIndex} / {totalItems} 표시
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                            aria-label="이전 10개"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {currentPage} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                            aria-label="다음 10개"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  <div className="sm:hidden">
                    <FarmSummaryCards
                      items={farmItems}
                      onSelect={onSelectFarm}
                      highlightRegistNos={highlightRegistNos}
                    />
                  </div>
                  <div className="hidden sm:block">
                    <FarmSummaryTable
                      items={farmItems}
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSortChange={onSortChange}
                      highlightRegistNos={highlightRegistNos}
                      visibleColumns={visibleColumns as {
                        totalRooms: boolean;
                        normal: boolean;
                        warn: boolean;
                        danger: boolean;
                        offline: boolean;
                        freshness: boolean;
                        lastUpdated: boolean;
                      } | undefined}
                    />
                  </div>
                </>
              )}
            </>
          )}
          {rooms && onSelectRoom && (
            <AlertsPanel
              rooms={rooms}
              onSelect={onSelectRoom}
              stateFilter={stateFilter}
              defaultCollapsed
              highlightKey12s={highlightKey12s}
            />
          )}
        </div>
      )}

      {view === "history" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {onSelectAllStatus && (
              <Button size="sm" variant="outline" onClick={onSelectAllStatus}>
                전체 선택
              </Button>
            )}
            {onClearStatus && (
              <Button size="sm" variant="ghost" onClick={onClearStatus}>
                전체 해제
              </Button>
            )}
            {statusMeta.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={stateFilter?.includes(s.id) ? "default" : "outline"}
                onClick={() => onToggleStatus?.(s.id)}
              >
                {s.label} {s.count}
              </Button>
            ))}
          </div>
          {(stateFilter.length > 0 ||
            debouncedSearch ||
            (sortBy && sortBy !== "registNo")) && (
            <div className="sticky top-10 z-20 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur border-b">
              <div className="flex flex-wrap items-center gap-2">
                {stateFilter.length > 0 &&
                  stateFilter.map((status) => (
                    <Badge
                      key={status}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {status}
                    </Badge>
                  ))}
                {debouncedSearch && (
                  <Badge variant="outline">검색: {debouncedSearch}</Badge>
                )}
                {sortBy && sortBy !== "registNo" && (
                  <Badge variant="outline">
                    정렬: {sortLabel?.[sortBy] ?? sortBy}
                    {sortDir === "asc" ? " ↑" : " ↓"}
                  </Badge>
                )}
                {onResetFilters && (
                  <Button variant="ghost" size="sm" onClick={onResetFilters}>
                    필터 초기화
                  </Button>
                )}
              </div>
            </div>
          )}
          <AlertsHistoryPanel registNo={registNo} />
        </div>
      )}
    </div>
  );
}
