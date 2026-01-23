// /rooms/[key12] 페이지

"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, FileX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopBar from "@/components/shell/TopBar";
import SensorsPanel from "@/components/rooms/SensorsPanel";
import MotorsPanel from "@/components/rooms/MotorsPanel";
import RoomTrendChart from "@/components/charts/RoomTrendChart";
import EmptyState from "@/components/common/EmptyState";
import RoomDetailSkeleton from "@/components/skeletons/RoomDetailSkeleton";
import type { RoomSnapshotFullDTO, RoomLogsResponseDTO } from "@/types/dto";
import { roomLabel, stallLabel, FARM_LABEL } from "@/lib/labels";

async function fetchRoomFull(key12: string): Promise<RoomSnapshotFullDTO> {
  const res = await fetch(`/api/rooms/${key12}`);
  if (!res.ok) {
    throw new Error("Failed to fetch room full");
  }
  return res.json();
}

async function fetchRoomLogs(
  key12: string,
  from?: string,
  to?: string,
  cursor?: string
): Promise<RoomLogsResponseDTO> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (cursor) params.set("cursor", cursor);
  params.set("limit", "120");
  const res = await fetch(`/api/rooms/${key12}/logs?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch room logs");
  }
  return res.json();
}

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const key12 = params.key12 as string;
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | null>(null);
  const [logItems, setLogItems] = useState<RoomLogsResponseDTO["items"]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLogsLoadedAt, setLastLogsLoadedAt] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  const { data: roomData, isLoading: roomLoading } = useQuery({
    queryKey: ["room-full", key12],
    queryFn: () => fetchRoomFull(key12),
    refetchInterval: 5000, // 5초 폴링
  });

  const { data: logsData, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ["room-logs", key12, timeRange],
    queryFn: () => {
      if (!timeRange) return null;
      const now = new Date();
      const from = new Date(now);
      if (timeRange === "1h") {
        from.setHours(from.getHours() - 1);
      } else if (timeRange === "24h") {
        from.setHours(from.getHours() - 24);
      }
      return fetchRoomLogs(key12, from.toISOString(), now.toISOString());
    },
    enabled: timeRange !== null,
  });

  useEffect(() => {
    if (!timeRange) {
      setLogItems([]);
      setNextCursor(undefined);
      setLastLogsLoadedAt(null);
      return;
    }
    if (logsData) {
      setLogItems(logsData.items);
      setNextCursor(logsData.nextCursor);
      setLastLogsLoadedAt(new Date().toLocaleString("ko-KR"));
    }
  }, [logsData, timeRange]);

  const handleLoadMore = async () => {
    if (!timeRange || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const now = new Date();
      const from = new Date(now);
      if (timeRange === "1h") {
        from.setHours(from.getHours() - 1);
      } else if (timeRange === "24h") {
        from.setHours(from.getHours() - 24);
      }
      const more = await fetchRoomLogs(
        key12,
        from.toISOString(),
        now.toISOString(),
        nextCursor
      );
      setLogItems((prev) => [...prev, ...more.items]);
      setNextCursor(more.nextCursor);
      setLastLogsLoadedAt(new Date().toLocaleString("ko-KR"));
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <RoomDetailSkeleton />
        </main>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <EmptyState
            title="방 데이터를 불러올 수 없습니다"
            description="잠시 후 다시 시도해 주세요."
            icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold">
            {roomLabel(roomData.mapping.roomNo)} 상세
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">{FARM_LABEL}:</span>{" "}
                {roomData.mapping.registNo}
              </div>
              <div>
                <span className="text-gray-600">축사:</span>{" "}
                {stallLabel(roomData.mapping.stallNo)}
              </div>
              <div>
                <span className="text-gray-600">방:</span>{" "}
                {roomLabel(roomData.mapping.roomNo)}
              </div>
              <div>
                <span className="text-gray-600">상태:</span>{" "}
                <span
                  className={
                    roomData.state === "normal"
                      ? "text-green-600"
                      : roomData.state === "warn"
                      ? "text-yellow-600"
                      : roomData.state === "danger"
                      ? "text-red-600"
                      : "text-gray-600"
                  }
                >
                  {roomData.state.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">측정 시간:</span>{" "}
                {new Date(roomData.timing.measureTsKst).toLocaleString("ko-KR")}
              </div>
              <div>
                <span className="text-gray-600">업데이트:</span>{" "}
                {new Date(roomData.timing.updatedAtKst).toLocaleString("ko-KR")}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <SensorsPanel sensors={roomData.sensors} />
          <MotorsPanel motors={roomData.motors} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>로그 데이터</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={timeRange || undefined}
              onValueChange={(value) => setTimeRange(value as "1h" | "24h" | null)}
              className="mb-4"
            >
              <TabsList>
                <TabsTrigger value="1h">최근 1시간</TabsTrigger>
                <TabsTrigger value="24h">최근 24시간</TabsTrigger>
              </TabsList>
            </Tabs>
            {logsLoading && <div>로딩 중...</div>}
            {logsError && (
              <div className="text-red-600 mb-2">로그 데이터를 불러오지 못했습니다.</div>
            )}
            {timeRange && logItems.length === 0 && !logsLoading && (
              <EmptyState
                title="로그 데이터가 없습니다"
                description="선택한 기간에 데이터가 없습니다."
                icon={<FileX className="h-5 w-5 text-muted-foreground" />}
              />
            )}
            {logItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChartOpen(true)}
                  >
                    차트 확대
                  </Button>
                </div>
                <RoomTrendChart logs={logItems} />
              </div>
            )}
            {!timeRange && (
              <div className="text-center text-gray-500 py-8">
                시간 범위를 선택하여 로그 데이터를 확인하세요.
              </div>
            )}
            {timeRange && logItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>표시 중: {logItems.length}건</span>
                  {lastLogsLoadedAt && <span>마지막 로드: {lastLogsLoadedAt}</span>}
                </div>
                <div className="flex justify-center">
                  {nextCursor ? (
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? "불러오는 중..." : "더 보기"}
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      모든 로그를 불러왔습니다.
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      {chartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[85vh] overflow-auto shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">로그 차트 확대</div>
              <Button variant="ghost" size="sm" onClick={() => setChartOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <RoomTrendChart logs={logItems} height={480} showTitle={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
