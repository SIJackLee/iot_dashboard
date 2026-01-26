// AlertsHistoryPanel 컴포넌트 - 과거 경고/위험/오프라인 목록

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import { roomLabel, stallLabel, FARM_LABEL } from "@/lib/labels";

type HistoryItem = {
  key12: string;
  registNo: string;
  stallNo: number;
  roomNo: number;
  state: "warn" | "danger" | "offline";
  occurredAtKst: string;
  maxValues: {
    es01: number;
    es02: number;
    es03: number;
    es04: number;
    es09: number;
  };
};

type HistoryResponse = {
  serverNowKst: string;
  items: HistoryItem[];
};

const rangeOptions = [
  { id: "1h", label: "최근 1시간" },
  { id: "6h", label: "최근 6시간" },
  { id: "24h", label: "최근 24시간" },
] as const;

const stateMeta = [
  { id: "warn", label: "경고", variant: "outline" },
  { id: "danger", label: "위험", variant: "destructive" },
  { id: "offline", label: "오프라인", variant: "outline" },
] as const;

async function fetchHistory(range: string, states: string[]) {
  const params = new URLSearchParams();
  params.set("range", range);
  params.set("limit", "50");
  params.set("states", states.join(","));
  const res = await fetch(`/api/alerts/history?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch alerts history");
  }
  return res.json() as Promise<HistoryResponse>;
}

interface AlertsHistoryPanelProps {
  registNo?: string;
}

export default function AlertsHistoryPanel({ registNo }: AlertsHistoryPanelProps) {
  const router = useRouter();
  const [range, setRange] = useState<(typeof rangeOptions)[number]["id"]>("6h");
  const [selectedStates, setSelectedStates] = useState<string[]>([
    "warn",
    "danger",
    "offline",
  ]);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts-history", range, selectedStates],
    queryFn: () => fetchHistory(range, selectedStates),
    refetchInterval: 60000,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const scopedItems = useMemo(
    () => (registNo ? items.filter((item) => item.registNo === registNo) : items),
    [items, registNo]
  );
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(scopedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, scopedItems.length);
  const pagedItems = scopedItems.slice(startIndex, endIndex);

  const handleRangeChange = (nextRange: (typeof rangeOptions)[number]["id"]) => {
    setRange(nextRange);
    setPage(1);
  };

  const toggleState = (stateId: string) => {
    setSelectedStates((prev) =>
      prev.includes(stateId) ? prev.filter((s) => s !== stateId) : [...prev, stateId]
    );
    setPage(1);
  };
  const badgeVariant = (state: string) => {
    if (state === "danger") return "destructive";
    return "outline";
  };

  const maxLabel = useMemo(() => {
    if (items.length === 0) return "N/A";
    const top = items[0].maxValues;
    return `ES03 ${top.es03}`;
  }, [items]);

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          과거 경고/위험/오프라인 목록
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={range === option.id ? "default" : "outline"}
              onClick={() => handleRangeChange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
          {stateMeta.map((state) => (
            <Button
              key={state.id}
              size="sm"
              variant={selectedStates.includes(state.id) ? "default" : "outline"}
              onClick={() => toggleState(state.id)}
            >
              {state.label}
            </Button>
          ))}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> 기준: {maxLabel}
          </span>
        </div>
        {error && (
          <div className="text-sm text-red-600 mb-2">
            목록을 불러오지 못했습니다.
          </div>
        )}
        {isLoading && (
          <div className="text-sm text-muted-foreground">불러오는 중...</div>
        )}
        {!isLoading && scopedItems.length === 0 ? (
          <EmptyState
            title="이력 데이터가 없습니다"
            description="선택한 조건에 해당하는 이력이 없습니다."
            icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
          />
        ) : (
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {startIndex + 1}-{endIndex} / {scopedItems.length} 표시
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
            {pagedItems.map((item) => (
              <div
                key={`${item.key12}-${item.occurredAtKst}`}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/rooms/${item.key12}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/rooms/${item.key12}`);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${FARM_LABEL} ${item.registNo} ${roomLabel(item.roomNo)} 상세 이동`}
              >
                <div className="flex items-center gap-3">
                  <Badge variant={badgeVariant(item.state)}>
                    {item.state.toUpperCase()}
                  </Badge>
                  <div className="text-sm">
                    <div className="font-medium">
                      {FARM_LABEL} {item.registNo} · {stallLabel(item.stallNo)} ·{" "}
                      {roomLabel(item.roomNo)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.occurredAtKst).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  ES01 {item.maxValues.es01} · ES02 {item.maxValues.es02} · ES03{" "}
                  {item.maxValues.es03} · ES04 {item.maxValues.es04} · ES09{" "}
                  {item.maxValues.es09}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
