"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, FileX, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TopBar from "@/components/shell/TopBar";
import MotorCardGrid from "@/components/rooms/MotorCardGrid";
import SensorCardGrid from "@/components/rooms/SensorCardGrid";
import EmptyState from "@/components/common/EmptyState";
import RoomDetailSkeleton from "@/components/skeletons/RoomDetailSkeleton";
import SensorTrendChart from "@/components/charts/SensorTrendChart";
import MotorSingleTrendChart from "@/components/charts/MotorSingleTrendChart";
import type {
  RoomSnapshotFullDTO,
  RoomLogsResponseDTO,
  RoomLogPointDTO,
  RoomLogDatesResponseDTO,
} from "@/types/dto";
import { roomLabel, stallLabel, FARM_LABEL } from "@/lib/labels";
import PullToRefresh from "@/components/common/PullToRefresh";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { kstCalendarTodayParts, kstDayRangeUtcIso } from "@/lib/timeKst";

async function fetchRoomFull(key12: string): Promise<RoomSnapshotFullDTO> {
  const res = await fetch(`/api/rooms/${key12}`);
  if (!res.ok) {
    throw new Error("Failed to fetch room full");
  }
  return res.json();
}

async function fetchRoomLogDates(
  key12: string,
  month: string
): Promise<RoomLogDatesResponseDTO> {
  const res = await fetch(
    `/api/rooms/${key12}/log-dates?month=${encodeURIComponent(month)}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch log dates");
  }
  return res.json();
}

async function fetchRoomLogsPage(
  key12: string,
  from?: string,
  to?: string,
  cursor?: string,
  limit = 300
): Promise<RoomLogsResponseDTO> {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  if (cursor) qs.set("cursor", cursor);
  qs.set("limit", String(limit));
  const res = await fetch(`/api/rooms/${key12}/logs?${qs.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch room logs");
  }
  return res.json();
}

const MAX_LOG_FETCH_ROUNDS = 80;

async function fetchAllLogsForDay(
  key12: string,
  yyyyMmDd: string
): Promise<RoomLogPointDTO[]> {
  const { fromUtcIso, toUtcInclusiveIso } = kstDayRangeUtcIso(yyyyMmDd);
  const merged: RoomLogPointDTO[] = [];
  const seen = new Set<string>();
  let cursor: string | undefined;
  for (let i = 0; i < MAX_LOG_FETCH_ROUNDS; i++) {
    const batch = await fetchRoomLogsPage(
      key12,
      fromUtcIso,
      toUtcInclusiveIso,
      cursor,
      300
    );
    for (const item of batch.items) {
      if (seen.has(item.measureTsKst)) continue;
      seen.add(item.measureTsKst);
      merged.push(item);
    }
    if (!batch.nextCursor) break;
    cursor = batch.nextCursor;
  }
  merged.sort(
    (a, b) =>
      new Date(a.measureTsKst).getTime() - new Date(b.measureTsKst).getTime()
  );
  return merged;
}

function shiftMonthYm(ym: string, delta: number): string {
  const [ys, ms] = ym.split("-");
  const y = parseInt(ys, 10);
  const mo = parseInt(ms, 10);
  const d = new Date(Date.UTC(y, mo - 1 + delta, 1));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}

export default function RoomDetailClient({ key12 }: { key12: string }) {
  const queryClient = useQueryClient();
  const [viewMonth, setViewMonth] = useState(() => kstCalendarTodayParts().yyyyMm);
  /** 월 단위로 고정된 사용자 선택(없으면 해당 월에서 데이터가 있는 가장 최근일) */
  const [pickedDateInMonth, setPickedDateInMonth] = useState<{
    month: string;
    date: string;
  } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<
    | { kind: "sensor"; key: "es01" | "es02" | "es03" | "es04" | "es09" }
    | { kind: "motor"; key: "ec01" | "ec02" | "ec03" }
    | null
  >(null);
  const logSectionRef = useRef<HTMLDivElement | null>(null);

  const { data: roomData, isLoading: roomLoading } = useQuery({
    queryKey: ["room-full", key12],
    queryFn: () => fetchRoomFull(key12),
    refetchInterval: 5000,
    enabled: !!key12,
  });

  const { data: logDatesData, isLoading: logDatesLoading } = useQuery({
    queryKey: ["room-log-dates", key12, viewMonth],
    queryFn: () => fetchRoomLogDates(key12, viewMonth),
    enabled: !!key12,
  });

  const datesAsc = useMemo(() => {
    const d = logDatesData?.dates ?? [];
    return [...d].sort();
  }, [logDatesData?.dates]);

  const selectedDate = useMemo(() => {
    const dates = logDatesData?.dates ?? [];
    if (dates.length === 0) return null;
    const asc = [...dates].sort();
    if (
      pickedDateInMonth &&
      pickedDateInMonth.month === viewMonth &&
      dates.includes(pickedDateInMonth.date)
    ) {
      return pickedDateInMonth.date;
    }
    return asc[asc.length - 1] ?? null;
  }, [logDatesData?.dates, viewMonth, pickedDateInMonth]);

  const {
    data: logItems = [],
    isLoading: logsLoading,
    error: logsError,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["room-logs-day", key12, selectedDate],
    queryFn: () => fetchAllLogsForDay(key12, selectedDate!),
    enabled: !!key12 && !!selectedDate,
  });

  const lastLogsLoadedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString("ko-KR")
    : null;

  const dateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00+09:00`).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : "";

  const goPrevDataDay = () => {
    if (!selectedDate || datesAsc.length === 0) return;
    const idx = datesAsc.indexOf(selectedDate);
    if (idx > 0) {
      setPickedDateInMonth({
        month: viewMonth,
        date: datesAsc[idx - 1]!,
      });
      return;
    }
    setPickedDateInMonth(null);
    setViewMonth((m) => shiftMonthYm(m, -1));
  };

  const goNextDataDay = () => {
    if (!selectedDate || datesAsc.length === 0) return;
    const idx = datesAsc.indexOf(selectedDate);
    if (idx >= 0 && idx < datesAsc.length - 1) {
      setPickedDateInMonth({
        month: viewMonth,
        date: datesAsc[idx + 1]!,
      });
      return;
    }
    setPickedDateInMonth(null);
    setViewMonth((m) => shiftMonthYm(m, 1));
  };

  const canStepDataDay = !!selectedDate && datesAsc.length > 0;

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
      <TopBar lastUpdatedAt={roomData.timing.updatedAtKst} pollingInterval={5000} />
      <PullToRefresh
        onRefresh={async () => {
          await queryClient.invalidateQueries({ queryKey: ["room-full", key12] });
          await queryClient.invalidateQueries({
            queryKey: ["room-log-dates", key12, viewMonth],
          });
          await queryClient.invalidateQueries({
            queryKey: ["room-logs-day", key12, selectedDate],
          });
        }}
      >
        <main className="container mx-auto px-4 py-4 sm:py-6">
          <Breadcrumbs
            items={[
              { label: "농장 목록", href: "/farms" },
              {
                label: roomData.mapping.registNo,
                href: `/farms/${roomData.mapping.registNo}`,
              },
              { label: stallLabel(roomData.mapping.stallNo) },
              { label: roomLabel(roomData.mapping.roomNo) },
            ]}
            className="mb-4"
          />

          <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">
                {roomLabel(roomData.mapping.roomNo)} 상세
              </h1>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  roomData.state === "normal"
                    ? "bg-green-100 text-green-700"
                    : roomData.state === "warn"
                      ? "bg-yellow-100 text-yellow-700"
                      : roomData.state === "danger"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                }`}
              >
                {roomData.state.toUpperCase()}
              </span>
            </div>
            <Button asChild variant="default" className="min-h-[44px] shrink-0">
              <Link
                href={`/rooms/${key12}/motor`}
                className="inline-flex items-center gap-2 min-h-[44px]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                모터 제어
              </Link>
            </Button>
          </div>

          {roomData.state === "offline" && (
            <div
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950"
              role="status"
            >
              <span className="font-semibold">오프라인</span>
              {" · 마지막 수신: "}
              {new Date(roomData.timing.updatedAtKst).toLocaleString("ko-KR")}
              {
                " · 센서·모터 카드의 측정값은 표시하지 않습니다. (스냅샷이 오래되었거나 수신이 끊긴 상태)"
              }
            </div>
          )}

          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">
                    {FARM_LABEL}:
                  </span>
                  <span className="font-medium text-sm sm:text-base text-right">
                    {roomData.mapping.registNo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">축사:</span>
                  <span className="font-medium text-sm sm:text-base text-right">
                    {stallLabel(roomData.mapping.stallNo)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">방:</span>
                  <span className="font-medium text-sm sm:text-base text-right">
                    {roomLabel(roomData.mapping.roomNo)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">상태:</span>
                  <span
                    className={`font-medium text-sm sm:text-base text-right ${
                      roomData.state === "normal"
                        ? "text-green-600"
                        : roomData.state === "warn"
                          ? "text-yellow-600"
                          : roomData.state === "danger"
                            ? "text-red-600"
                            : "text-gray-600"
                    }`}
                  >
                    {roomData.state.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">
                    측정 시간:
                  </span>
                  <span className="font-medium text-sm sm:text-base text-right">
                    {new Date(roomData.timing.measureTsKst).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">
                    업데이트:
                  </span>
                  <span className="font-medium text-sm sm:text-base text-right">
                    {new Date(roomData.timing.updatedAtKst).toLocaleString("ko-KR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">센서 현황</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <SensorCardGrid
                sensors={roomData.sensors}
                logs={logItems}
                roomState={roomData.state}
                onSelectSensor={(sensorKey) => {
                  if (!selectedDate) return;
                  setSelectedDetail({ kind: "sensor", key: sensorKey });
                  setTimeout(
                    () =>
                      logSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      }),
                    0
                  );
                }}
              />
            </CardContent>
          </Card>

          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">모터 현황</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <MotorCardGrid
                motors={roomData.motors}
                logs={logItems}
                roomState={roomData.state}
                onSelectMotor={(motorKey) => {
                  if (!selectedDate) return;
                  setSelectedDetail({ kind: "motor", key: motorKey });
                  setTimeout(
                    () =>
                      logSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      }),
                    0
                  );
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">로그 데이터</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={logSectionRef} />

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-10 min-w-10 shrink-0"
                    aria-label="이전 달"
                    onClick={() => {
                      setPickedDateInMonth(null);
                      setViewMonth((m) => shiftMonthYm(m, -1));
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[7rem] text-center text-sm font-medium tabular-nums">
                    {logDatesLoading ? "…" : formatMonthLabel(viewMonth)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="min-h-10 min-w-10 shrink-0"
                    aria-label="다음 달"
                    onClick={() => {
                      setPickedDateInMonth(null);
                      setViewMonth((m) => shiftMonthYm(m, 1));
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {datesAsc.length > 0 && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 flex-1 sm:max-w-md">
                    <Select
                      value={selectedDate ?? undefined}
                      onValueChange={(v) =>
                        setPickedDateInMonth({ month: viewMonth, date: v })
                      }
                    >
                      <SelectTrigger className="min-h-11 w-full">
                        <SelectValue placeholder="날짜 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...datesAsc].reverse().map((d) => (
                          <SelectItem key={d} value={d}>
                            {new Date(`${d}T12:00:00+09:00`).toLocaleDateString(
                              "ko-KR",
                              {
                                month: "long",
                                day: "numeric",
                                weekday: "short",
                              }
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11"
                        disabled={!canStepDataDay}
                        onClick={goPrevDataDay}
                      >
                        이전 데이터일
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-11"
                        disabled={!canStepDataDay}
                        onClick={goNextDataDay}
                      >
                        다음 데이터일
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {logDatesLoading && (
                <div className="text-sm sm:text-base">날짜 목록 로딩 중…</div>
              )}
              {!logDatesLoading &&
                logDatesData &&
                (logDatesData.dates?.length ?? 0) === 0 && (
                  <EmptyState
                    title="이 달에 저장된 로그가 없습니다"
                    description="다른 달을 선택해 보세요."
                    icon={<FileX className="h-5 w-5 text-muted-foreground" />}
                  />
                )}

              {logsLoading && selectedDate && (
                <div className="text-sm sm:text-base">로그 불러오는 중…</div>
              )}
              {logsError && (
                <div className="text-red-600 mb-2 text-sm sm:text-base">
                  로그 데이터를 불러오지 못했습니다.
                </div>
              )}

              {selectedDate && !logsLoading && logItems.length === 0 && (
                <EmptyState
                  title="로그 데이터가 없습니다"
                  description="선택한 날짜에 데이터가 없습니다."
                  icon={<FileX className="h-5 w-5 text-muted-foreground" />}
                />
              )}

              {logItems.length > 0 && (
                <div className="space-y-2">
                  {selectedDetail && selectedDate && (
                    <div className="rounded-lg border bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="font-semibold text-sm">
                          {selectedDetail.kind === "sensor" ? "센서" : "모터"} 상세 그래프 ·{" "}
                          {dateLabel}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetail(null)}
                          className="min-h-[44px]"
                        >
                          닫기
                        </Button>
                      </div>
                      {selectedDetail.kind === "sensor" ? (
                        <SensorTrendChart
                          logs={logItems}
                          sensorKey={selectedDetail.key}
                          height={360}
                        />
                      ) : (
                        <MotorSingleTrendChart
                          logs={logItems}
                          motorKey={selectedDetail.key}
                          height={360}
                        />
                      )}
                    </div>
                  )}
                  <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
                    센서/모터 현황 카드를 클릭하면 선택한 날(KST) 로그 상세 그래프를 확인할 수
                    있습니다.
                  </div>
                </div>
              )}

              {logItems.length > 0 && (
                <div className="mt-3 sm:mt-4 space-y-2">
                  <div className="text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                    <span>표시 중: {logItems.length}건</span>
                    {lastLogsLoadedAt && (
                      <span className="text-xs">갱신: {lastLogsLoadedAt}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    해당 날짜 구간의 로그를 모두 합쳐 표시합니다.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </PullToRefresh>
    </div>
  );
}
