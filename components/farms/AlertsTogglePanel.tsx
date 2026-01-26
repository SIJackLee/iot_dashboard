// AlertsTogglePanel 컴포넌트 - 현재/과거 토글 통합

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AlertsPanel from "@/components/farms/AlertsPanel";
import AlertsHistoryPanel from "@/components/farms/AlertsHistoryPanel";
import FarmSummaryFilters from "@/components/farms/FarmSummaryFilters";
import { Filter } from "lucide-react";
import type { RoomSnapshotLiteDTO } from "@/types/dto";

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
          {onSearchChange && onSortChange && (
            <FarmSummaryFilters
              onSearchChange={onSearchChange}
              onSortChange={onSortChange}
            />
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
