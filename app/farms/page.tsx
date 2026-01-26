// /farms 페이지

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Filter, Inbox, SearchX } from "lucide-react";
import TopBar from "@/components/shell/TopBar";
import dynamic from "next/dynamic";
import FarmSummaryTable from "@/components/farms/FarmSummaryTable";
import FarmSummaryCards from "@/components/farms/FarmSummaryCards";
import EmptyState from "@/components/common/EmptyState";
import KpiCardsSkeleton from "@/components/skeletons/KpiCardsSkeleton";
import FarmSummaryTableSkeleton from "@/components/skeletons/FarmSummaryTableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { FarmsSummaryResponseDTO } from "@/types/dto";
import FarmOverviewHeader from "@/components/farms/FarmOverviewHeader";
import AlertsTogglePanel from "@/components/farms/AlertsTogglePanel";

const OfflineBanner = dynamic(() => import("@/components/farms/OfflineBanner"), {
  ssr: false,
  loading: () => <div className="h-16 w-full" />,
});

async function fetchFarmsSummary(): Promise<FarmsSummaryResponseDTO> {
  const res = await fetch("/api/farms/summary");
  if (!res.ok) {
    throw new Error("Failed to fetch farms summary");
  }
  return res.json();
}

export default function FarmsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("registNo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  type StatusKey = "normal" | "warn" | "danger" | "offline";
  const [statusFilter, setStatusFilter] = useState<StatusKey[]>([]);
  const [showDeferred, setShowDeferred] = useState(false);
  const [page, setPage] = useState(1);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevSnapshotRef = useRef<Map<string, string>>(new Map());
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [visibleColumns, setVisibleColumns] = useState({
    totalRooms: true,
    normal: true,
    warn: true,
    danger: true,
    offline: true,
    freshness: true,
    lastUpdated: true,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["farms-summary"],
    queryFn: fetchFarmsSummary,
    refetchInterval: 15000, // 15초 폴링
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const onIdle = () => {
      if (!cancelled) setShowDeferred(true);
    };
    const idleCallback = (window as any).requestIdleCallback;
    let handle: number;
    if (typeof idleCallback === "function") {
      handle = idleCallback(onIdle, { timeout: 200 });
      return () => {
        cancelled = true;
        (window as any).cancelIdleCallback?.(handle);
      };
    }
    handle = window.setTimeout(onIdle, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, []);

  // 필터링 및 정렬 (데이터가 있을 때만)
  const baseItems = data
    ? (() => {
        let items = [...data.items];
        if (debouncedSearch) {
          items = items.filter((item) =>
            item.registNo.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        if (sortBy === "registNo") {
          items.sort((a, b) =>
            sortDir === "asc"
              ? a.registNo.localeCompare(b.registNo)
              : b.registNo.localeCompare(a.registNo)
          );
        } else if (sortBy === "totalRooms") {
          items.sort((a, b) =>
            sortDir === "asc"
              ? a.totalRooms - b.totalRooms
              : b.totalRooms - a.totalRooms
          );
        } else if (sortBy === "offline") {
          items.sort((a, b) =>
            sortDir === "asc" ? a.offline - b.offline : b.offline - a.offline
          );
        } else if (sortBy === "danger") {
          items.sort((a, b) =>
            sortDir === "asc" ? a.danger - b.danger : b.danger - a.danger
          );
        } else if (sortBy === "freshness") {
          items.sort((a, b) => {
            const aFresh = a.freshnessSec ?? Infinity;
            const bFresh = b.freshnessSec ?? Infinity;
            return sortDir === "asc" ? aFresh - bFresh : bFresh - aFresh;
          });
        }
        return items;
      })()
    : [];

  const filteredItems = statusFilter.length > 0
    ? baseItems.filter((item) => {
        const state: "normal" | "warn" | "danger" | "offline" =
          item.offline > 0
            ? "offline"
            : item.danger > 0
            ? "danger"
            : item.warn > 0
            ? "warn"
            : "normal";
        return statusFilter.includes(state);
      })
    : baseItems;
  const handleStatusSelect = (id: StatusKey) => {
    setStatusFilter((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortDir, statusFilter.join(",")]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredItems.length);
  const pagedItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [page, currentPage]);

  useEffect(() => {
    if (!data) return;
    const nextMap = new Map<string, string>();
    const changed = new Set<string>();
    for (const item of data.items) {
      const snapshot = `${item.totalRooms}-${item.normal}-${item.warn}-${item.danger}-${item.offline}-${item.freshnessSec ?? "na"}`;
      nextMap.set(item.registNo, snapshot);
      const prev = prevSnapshotRef.current.get(item.registNo);
      if (prev && prev !== snapshot) {
        changed.add(item.registNo);
      }
    }
    prevSnapshotRef.current = nextMap;
    if (changed.size > 0) {
      setHighlighted(changed);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setHighlighted(new Set());
      }, 2000);
    }
  }, [data]);

  // 전체 통계
  const totalNormal = baseItems.reduce((sum, item) => sum + item.normal, 0);
  const totalWarn = baseItems.reduce((sum, item) => sum + item.warn, 0);
  const totalDanger = baseItems.reduce(
    (sum, item) => sum + item.danger,
    0
  );
  const totalOffline = baseItems.reduce(
    (sum, item) => sum + item.offline,
    0
  );
  const totalRooms = baseItems.reduce((sum, item) => sum + item.totalRooms, 0);
  const normalRate = totalRooms > 0 ? (totalNormal / totalRooms) * 100 : 0;
  const offlineRate = totalRooms > 0 ? (totalOffline / totalRooms) * 100 : 0;
  
  // 마지막 업데이트 시간 (가장 최신)
  const lastUpdatedAtKst = baseItems.length > 0
    ? baseItems.reduce((latest, item) => {
        if (!item.lastUpdatedAtKst) return latest;
        if (!latest) return item.lastUpdatedAtKst;
        return new Date(item.lastUpdatedAtKst) > new Date(latest)
          ? item.lastUpdatedAtKst
          : latest;
      }, null as string | null)
    : null;

  const statusPieData = [
    { id: "normal", name: "정상", value: totalNormal, color: "#22c55e" },
    { id: "warn", name: "경고", value: totalWarn, color: "#eab308" },
    { id: "danger", name: "위험", value: totalDanger, color: "#ef4444" },
    { id: "offline", name: "오프라인", value: totalOffline, color: "#9ca3af" },
  ];
  const statusMeta = [
    { id: "normal", label: "정상", count: totalNormal },
    { id: "warn", label: "경고", count: totalWarn },
    { id: "danger", label: "위험", count: totalDanger },
    { id: "offline", label: "오프라인", count: totalOffline },
  ] as const;

  const statusLabel: Record<string, string> = {
    normal: "정상",
    warn: "경고",
    danger: "위험",
    offline: "오프라인",
  };
  const sortLabel: Record<string, string> = {
    registNo: "농장",
    totalRooms: "총 방",
    offline: "오프라인",
    danger: "위험",
    freshness: "최신성",
  };
  const defaultSortDir: Record<string, "asc" | "desc"> = {
    registNo: "asc",
    totalRooms: "desc",
    danger: "desc",
    offline: "desc",
    freshness: "asc",
  };

  const handleSortChange = (key: string) => {
    if (key === sortBy) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortDir(defaultSortDir[key] ?? "desc");
  };

  // 조건부 return
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">농장 목록</h1>
          <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <KpiCardsSkeleton />
          <FarmSummaryTableSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>데이터를 불러오지 못했습니다</AlertTitle>
              <AlertDescription>오류: {String(error)}</AlertDescription>
            </Alert>
            <EmptyState
              title="농장 데이터를 불러올 수 없습니다"
              description="잠시 후 다시 시도해 주세요."
              icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
            />
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        summary={
          <>
            <span>정상률 {normalRate.toFixed(1)}%</span>
            <span>오프라인율 {offlineRate.toFixed(1)}%</span>
            <span>전체 방 {totalRooms}</span>
          </>
        }
      />
      <main className="container mx-auto px-4 py-6">
        <FarmOverviewHeader
          lastUpdatedAtKst={lastUpdatedAtKst}
          title="농장 목록"
          totalRooms={totalRooms}
          normalRate={normalRate}
          offlineRate={offlineRate}
          farmCount={baseItems.length}
          statusPieData={statusPieData}
          statusFilter={statusFilter}
          onStatusSelect={(id) => handleStatusSelect(id as StatusKey)}
        />
        {filteredItems.length === 0 ? (
          <EmptyState
            title={
              debouncedSearch || statusFilter.length > 0
                ? "조건에 맞는 농장이 없습니다"
                : "표시할 농장이 없습니다"
            }
            description={
              debouncedSearch || statusFilter.length > 0
                ? "필터를 해제하거나 다른 조건을 선택해 보세요."
                : "현재 표시할 농장 데이터가 없습니다."
            }
            icon={
              debouncedSearch || statusFilter.length > 0 ? (
                <SearchX className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Inbox className="h-5 w-5 text-muted-foreground" />
              )
            }
            actionLabel={search ? "필터 초기화" : undefined}
            onAction={
              search
                ? () => {
                    setSearch("");
                    setStatusFilter([]);
                    setSortBy("registNo");
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1}-{endIndex} / {filteredItems.length} 표시
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="다음 10개"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="sm:hidden">
              <FarmSummaryCards
                items={pagedItems}
                onSelect={(registNo) => router.push(`/farms/${registNo}`)}
                highlightRegistNos={highlighted}
              />
            </div>
            <div className="hidden sm:block">
              <FarmSummaryTable
                items={pagedItems}
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={handleSortChange}
                highlightRegistNos={highlighted}
                visibleColumns={visibleColumns}
              />
            </div>
          </>
        )}
        {showDeferred && (
          <div className="mt-6 space-y-4">
            <OfflineBanner
              lastUpdatedAtKst={lastUpdatedAtKst}
              totalOffline={totalOffline}
              totalRooms={totalRooms}
            />
            <AlertsTogglePanel
              registNo={undefined}
              stateFilter={statusFilter}
              statusMeta={statusMeta.map((s) => ({
                id: s.id,
                label: s.label,
                count: s.count,
              }))}
              onToggleStatus={(id) => handleStatusSelect(id as StatusKey)}
              onSelectAllStatus={() =>
                setStatusFilter(["normal", "warn", "danger", "offline"])
              }
              onClearStatus={() => setStatusFilter([])}
              debouncedSearch={debouncedSearch}
              sortLabel={sortLabel}
              sortBy={sortBy}
              sortDir={sortDir}
              onResetFilters={() => {
                setStatusFilter([]);
                setSearch("");
                setSortBy("registNo");
                setSortDir("asc");
              }}
              onSearchChange={setSearch}
              onSortChange={handleSortChange}
              visibleColumns={visibleColumns}
              onToggleColumn={(key) =>
                setVisibleColumns((prev) => ({
                  ...prev,
                  [key]: !prev[key as keyof typeof prev],
                }))
              }
              defaultView="history"
            />
          </div>
        )}
      </main>
    </div>
  );
}
