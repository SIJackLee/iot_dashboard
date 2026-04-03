"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Filter, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/shell/TopBar";
import StallTabs from "@/components/farms/StallTabs";
import RoomGrid from "@/components/rooms/RoomGrid";
import AlertsPanel from "@/components/farms/AlertsPanel";
import AlertsHistoryPanel from "@/components/farms/AlertsHistoryPanel";
import EmptyState from "@/components/common/EmptyState";
import KpiCardsSkeleton from "@/components/skeletons/KpiCardsSkeleton";
import RoomGridSkeleton from "@/components/skeletons/RoomGridSkeleton";
import { Badge } from "@/components/ui/badge";
import type { FarmDetailDTO } from "@/types/dto";
import CriticalAlertBanner from "@/components/alerts/CriticalAlertBanner";
import Breadcrumbs from "@/components/common/Breadcrumbs";

async function fetchFarmDetail(registNo: string): Promise<FarmDetailDTO> {
  const res = await fetch(`/api/farms/${registNo}/detail`);
  if (!res.ok) {
    throw new Error("Failed to fetch farm detail");
  }
  return res.json();
}

export default function FarmDetailClient({ registNo }: { registNo: string }) {
  const router = useRouter();
  const [currentStall, setCurrentStall] = useState(1);
  type StatusKey = "normal" | "warn" | "danger" | "offline";
  const [statusFilter, setStatusFilter] = useState<StatusKey[]>([]);
  const [highlightedRooms, setHighlightedRooms] = useState<Set<string>>(new Set());
  const [alertsView, setAlertsView] = useState<"history" | "current">("history");
  const prevRoomsRef = useRef<Map<string, string>>(new Map());
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStatusSelect = (id: StatusKey) => {
    setStatusFilter((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["farm-detail", registNo],
    queryFn: () => fetchFarmDetail(registNo),
    refetchInterval: 3000, // 3초 폴링
    enabled: !!registNo,
  });

  const effectiveStall = useMemo(() => {
    if (!data) return currentStall;
    const stallNos = data.stalls.map((s) => s.stallNo);
    if (stallNos.length === 0) return currentStall;
    return stallNos.includes(currentStall) ? currentStall : stallNos[0];
  }, [data, currentStall]);

  useEffect(() => {
    if (!data) return;
    const nextMap = new Map<string, string>();
    const changed = new Set<string>();
    for (const stall of data.stalls) {
      for (const room of stall.rooms) {
        const snapshot = `${room.state}-${room.freshnessSec ?? "na"}-${room.updatedAtKst ?? "na"}`;
        nextMap.set(room.key12, snapshot);
        const prev = prevRoomsRef.current.get(room.key12);
        if (prev && prev !== snapshot) {
          changed.add(room.key12);
        }
      }
    }
    prevRoomsRef.current = nextMap;
    if (changed.size > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlightedRooms(changed);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedRooms(new Set());
      }, 2000);
    }
  }, [data]);

  const handleRoomClick = (key12: string) => {
    router.push(`/rooms/${key12}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <KpiCardsSkeleton />
          <RoomGridSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">오류: {String(error)}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <EmptyState
            title="농장 데이터를 불러올 수 없습니다"
            description="잠시 후 다시 시도해 주세요."
            icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
          />
        </main>
      </div>
    );
  }

  const currentStallData = data.stalls.find((s) => s.stallNo === effectiveStall);
  const allRooms = data.stalls.flatMap((stall) => stall.rooms);
  const statusMeta = [
    { id: "normal", label: "정상", count: data.summary.normal },
    { id: "warn", label: "경고", count: data.summary.warn },
    { id: "danger", label: "위험", count: data.summary.danger },
    { id: "offline", label: "오프라인", count: data.summary.offline },
  ] as const;

  const statusLabel: Record<string, string> = {
    normal: "정상",
    warn: "경고",
    danger: "위험",
    offline: "오프라인",
  };

  const dangerRooms = data.stalls.flatMap((stall) =>
    stall.rooms
      .filter((room) => room.state === "danger")
      .map((room) => ({
        key12: room.key12,
        stallNo: room.stallNo,
        roomNo: room.roomNo,
        registNo,
      }))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        lastUpdatedAt={data.summary.lastUpdatedAtKst}
        pollingInterval={3000}
        dangerCount={data.summary.danger}
        warnCount={data.summary.warn}
      />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[{ label: "농장 목록", href: "/farms" }, { label: registNo }]}
          className="mb-4"
        />

        {dangerRooms.length > 0 && (
          <CriticalAlertBanner dangerRooms={dangerRooms} onRoomClick={handleRoomClick} />
        )}

        <div className="mb-4">
          <h1 className="text-2xl font-bold">농장 상세: {registNo}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStatusFilter(["normal", "warn", "danger", "offline"])}
            className="min-h-[44px] touch-manipulation"
          >
            전체 선택
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setStatusFilter([])}
            className="min-h-[44px] touch-manipulation"
          >
            전체 해제
          </Button>
          {statusMeta.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={statusFilter.includes(s.id) ? "default" : "outline"}
              onClick={() => handleStatusSelect(s.id)}
              className="min-h-[44px] touch-manipulation"
            >
              {s.label} {s.count}
            </Button>
          ))}
        </div>

        {statusFilter.length > 0 && (
          <div className="sticky top-0 z-20 -mx-4 px-4 py-2 mb-4 bg-gray-50/95 backdrop-blur border-b">
            <div className="flex items-center gap-2">
              {statusFilter.map((status) => (
                <Badge key={status} variant="outline" className="flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  {statusLabel[status] ?? status}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter([])}>
                필터 해제
              </Button>
            </div>
          </div>
        )}

        <StallTabs
          stalls={data.stalls}
          currentStall={effectiveStall}
          onStallChange={setCurrentStall}
          sticky
        />

        {currentStallData ? (
          (() => {
            const rooms =
              statusFilter.length > 0
                ? currentStallData.rooms.filter((room) => statusFilter.includes(room.state))
                : currentStallData.rooms;
            if (rooms.length === 0) {
              return (
                <EmptyState
                  title={
                    statusFilter.length > 0
                      ? "선택한 상태의 방이 없습니다"
                      : "해당 Stall에 방 데이터가 없습니다"
                  }
                  description={
                    statusFilter.length > 0
                      ? "필터를 해제하거나 다른 Stall을 선택해 보세요."
                      : "다른 Stall을 선택해 보세요."
                  }
                  icon={<Inbox className="h-5 w-5 text-muted-foreground" />}
                />
              );
            }
            return (
              <RoomGrid
                rooms={rooms}
                onRoomClick={handleRoomClick}
                highlightKey12s={highlightedRooms}
              />
            );
          })()
        ) : (
          <EmptyState
            title="축사 정보를 찾을 수 없습니다"
            description="다른 Stall을 선택해 보세요."
            icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
          />
        )}

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={alertsView === "history" ? "default" : "outline"}
              onClick={() => setAlertsView("history")}
            >
              과거 이력
            </Button>
            <Button
              size="sm"
              variant={alertsView === "current" ? "default" : "outline"}
              onClick={() => setAlertsView("current")}
            >
              현재 알림
            </Button>
          </div>
          {alertsView === "history" ? (
            <AlertsHistoryPanel registNo={registNo} />
          ) : (
            <AlertsPanel
              rooms={allRooms}
              onSelect={handleRoomClick}
              stateFilter={statusFilter}
              defaultCollapsed
              highlightKey12s={highlightedRooms}
            />
          )}
        </div>
      </main>
    </div>
  );
}

