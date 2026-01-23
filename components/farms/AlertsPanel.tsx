// AlertsPanel 컴포넌트 - offline/danger만 모아보기

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Search, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RoomSnapshotLiteDTO } from "@/types/dto";
import { roomLabel, stallLabel } from "@/lib/labels";

interface AlertsPanelProps {
  rooms: RoomSnapshotLiteDTO[];
  onSelect?: (key12: string) => void;
  stateFilter?: ("normal" | "warn" | "danger" | "offline")[];
  defaultCollapsed?: boolean;
  highlightKey12s?: Set<string>;
}

export default function AlertsPanel({
  rooms,
  onSelect,
  stateFilter,
  defaultCollapsed = false,
  highlightKey12s,
}: AlertsPanelProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"severity" | "freshness">("severity");
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // offline과 danger만 필터링
  const alertRooms = useMemo(() => {
    let items = rooms.filter(
      (room) => room.state === "offline" || room.state === "danger"
    );
    if (stateFilter && stateFilter.length > 0) {
      items = items.filter((room) => stateFilter.includes(room.state));
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (room) =>
          String(room.roomNo).includes(q) ||
          String(room.stallNo).includes(q) ||
          room.key12.toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => {
      if (sortBy === "freshness") {
        const aFresh = a.freshnessSec ?? -1;
        const bFresh = b.freshnessSec ?? -1;
        return bFresh - aFresh;
      }
      // severity: offline 먼저, 그 다음 danger
      const aRank = a.state === "offline" ? 0 : 1;
      const bRank = b.state === "offline" ? 0 : 1;
      if (aRank !== bRank) return aRank - bRank;
      const aFresh = a.freshnessSec ?? -1;
      const bFresh = b.freshnessSec ?? -1;
      return bFresh - aFresh;
    });
    return items;
  }, [rooms, search, sortBy, stateFilter]);

  const offlineCount = useMemo(
    () => alertRooms.filter((room) => room.state === "offline").length,
    [alertRooms]
  );
  const dangerCount = useMemo(
    () => alertRooms.filter((room) => room.state === "danger").length,
    [alertRooms]
  );

  if (alertRooms.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            알림 ({alertRooms.length}개)
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
              오프라인 {offlineCount}
            </Badge>
            <Badge variant="destructive">
              위험 {dangerCount}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? (
              <>
                펼치기 <ChevronDown className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                접기 <ChevronUp className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="방/축사/Key12 검색"
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">정렬</span>
              <Button
                variant={sortBy === "severity" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("severity")}
              >
                심각도
              </Button>
              <Button
                variant={sortBy === "freshness" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("freshness")}
              >
                오래된 순
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {alertRooms.map((room) => (
              <div
                key={room.key12}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 ${
                  highlightKey12s?.has(room.key12) ? "bg-yellow-50" : ""
                }`}
                onClick={() => onSelect?.(room.key12)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(room.key12);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${roomLabel(room.roomNo)} (${stallLabel(room.stallNo)}) 알림 상세 보기`}
              >
                <div className="flex items-center gap-3">
                  {room.state === "offline" ? (
                    <WifiOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {roomLabel(room.roomNo)} ({stallLabel(room.stallNo)})
                    </div>
                    <div className="text-sm text-gray-500">
                      {room.state === "offline"
                        ? "오프라인"
                        : `위험 상태 (${room.freshnessSec !== null ? `${Math.floor(room.freshnessSec / 60)}분 전` : "N/A"})`}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={room.state === "danger" ? "destructive" : "outline"}
                  className={
                    room.state === "offline"
                      ? "bg-gray-200 text-gray-800 border-gray-300"
                      : ""
                  }
                >
                  {room.state.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
