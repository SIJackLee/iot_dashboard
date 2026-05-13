"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Box,
  Database,
  Factory,
  Radio,
  Tag,
  Waves,
} from "lucide-react";
import TopBar from "@/components/shell/TopBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diffSec } from "@/lib/timeKst";
import { cn } from "@/lib/utils";
import type { JsonRawItemDTO, JsonRawListResponseDTO, JsonValue } from "@/types/dto";

async function fetchJsonRaw(): Promise<JsonRawListResponseDTO> {
  const response = await fetch("/api/json/raw", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch JSON raw");
  }

  return response.json();
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function formatJsonValue(value: JsonValue | undefined): string {
  if (value === undefined || value === null) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function buildLatestFarmRows(items: JsonRawItemDTO[]): JsonRawItemDTO[] {
  const deduped = new Map<string, JsonRawItemDTO>();
  for (const item of items) {
    if (!deduped.has(item.registNo)) {
      deduped.set(item.registNo, item);
    }
  }
  return [...deduped.values()];
}

function parseDisplayScalar(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function getFarmMeta(item: JsonRawItemDTO, serverNowKst?: string) {
  const freshness = diffSec(serverNowKst ?? new Date().toISOString(), item.savedAtKst ?? item.receivedAtKst);
  const eqpmnItems = item.payload.eqpmn ?? [];

  return {
    stallNo: parseDisplayScalar(item.payload.stall_no),
    roomNo: parseDisplayScalar(item.payload.room_no),
    eqpmnItems,
    eqpmnCount: eqpmnItems.length,
    isFresh: freshness <= 20,
  };
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function JsonPage() {
  const [selectedRegistNo, setSelectedRegistNo] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["json-raw-v2"],
    queryFn: fetchJsonRaw,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
    staleTime: 4000,
    retry: 1,
  });

  const latestFarmRows = useMemo(
    () => buildLatestFarmRows(data?.items ?? []),
    [data?.items]
  );

  const effectiveSelectedRegistNo =
    selectedRegistNo && latestFarmRows.some((item) => item.registNo === selectedRegistNo)
      ? selectedRegistNo
      : latestFarmRows[0]?.registNo ?? null;

  const selectedItem = useMemo(
    () =>
      latestFarmRows.find((item) => item.registNo === effectiveSelectedRegistNo) ??
      latestFarmRows[0] ??
      null,
    [effectiveSelectedRegistNo, latestFarmRows]
  );

  const selectedMeta = useMemo(
    () => (selectedItem ? getFarmMeta(selectedItem, data?.serverNowKst) : null),
    [data?.serverNowKst, selectedItem]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        lastUpdatedAt={data?.serverNowKst ?? null}
        pollingInterval={5000}
        summary={
          <>
            <span>RAW {data?.totalCount ?? 0}</span>
            <span>FARMS {latestFarmRows.length}</span>
          </>
        }
      />
      <main className="container mx-auto space-y-6 px-4 py-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>JSON 데이터 조회 실패</AlertTitle>
            <AlertDescription>
              최신 JSON Raw 데이터를 불러오지 못했습니다.
            </AlertDescription>
          </Alert>
        )}

        <section className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">JSON v2 Dashboard</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            `iot_room_state_json_raw` 최신 200건 기준 모니터링입니다. WebGL 시각화는
            제거되었고, 농장별 최신 Raw 카드와 상세 패널로 상태를 확인합니다.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="총 Raw 건수"
            value={isLoading ? "..." : String(data?.totalCount ?? 0)}
            icon={<Database className="h-4 w-4" />}
          />
          <SummaryCard
            title="등록 농장 수"
            value={isLoading ? "..." : String(latestFarmRows.length)}
            icon={<Factory className="h-4 w-4" />}
          />
          <SummaryCard
            title="가장 최근 수신 시각"
            value={isLoading ? "..." : formatDateTime(data?.latestReceivedAtKst)}
            icon={<Radio className="h-4 w-4" />}
          />
          <SummaryCard
            title="최근 Topic"
            value={isLoading ? "..." : data?.latestTopic ?? "-"}
            icon={<Tag className="h-4 w-4" />}
          />
        </section>

        <section className="space-y-4">
          {isLoading && latestFarmRows.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </CardContent>
            </Card>
          ) : latestFarmRows.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                표시할 JSON Raw 데이터가 없습니다.
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Latest Farm Raw Cards</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      regist_no 기준 최신 1건씩 선택합니다. WebGL 관련 표현은 제거되고 카드형
                      모니터링으로 동작합니다.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    selected {selectedItem?.registNo ?? "-"}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {latestFarmRows.map((item) => {
                  const meta = getFarmMeta(item, data?.serverNowKst);
                  const isSelected = selectedItem?.registNo === item.registNo;

                  return (
                    <Button
                      key={item.registNo}
                      type="button"
                      variant="ghost"
                      className={cn(
                        "h-auto min-h-36 w-full justify-start rounded-2xl border px-4 py-4 text-left",
                        isSelected
                          ? "border-cyan-300 bg-cyan-50 hover:bg-cyan-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                      onClick={() => setSelectedRegistNo(item.registNo)}
                    >
                      <div className="w-full space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">
                              {item.registNo}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              칸 {meta.stallNo ?? "-"} · 방 {meta.roomNo ?? "-"}
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              meta.isFresh
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {meta.isFresh ? "live" : "idle"}
                          </Badge>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 px-3 py-2">
                            <div className="text-[11px] text-slate-500">topic</div>
                            <div className="mt-1 line-clamp-1 text-xs font-medium text-slate-900">
                              {item.topic}
                            </div>
                          </div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2">
                            <div className="text-[11px] text-slate-500">eqpmn</div>
                            <div className="mt-1 text-xs font-medium text-slate-900">
                              {meta.eqpmnCount}
                            </div>
                          </div>
                        </div>
                        <div className="line-clamp-2 text-xs text-slate-500">
                          {meta.eqpmnItems.length > 0
                            ? meta.eqpmnItems
                                .slice(0, 2)
                                .map((entry) => `${entry.name}: ${formatJsonValue(entry.values)}`)
                                .join(" | ")
                            : "eqpmn 배열 없음"}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </section>

        {selectedItem && selectedMeta && (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.5fr)_360px]">
            <Card className="shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-2xl text-gray-900">
                        {selectedItem.registNo}
                      </CardTitle>
                      <Badge variant="outline">{selectedItem.topic}</Badge>
                      <Badge
                        className={cn(
                          selectedMeta.isFresh
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        )}
                      >
                        {selectedMeta.isFresh ? "live" : "idle"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      선택한 농장의 최신 JSON Raw 상세 정보
                    </p>
                  </div>
                  <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-right">
                    <div className="text-xs text-slate-500">payload.seq</div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">
                      {formatJsonValue(selectedItem.payload.seq)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    {
                      label: "topic",
                      value: selectedItem.topic,
                      icon: <Tag className="h-4 w-4" />,
                    },
                    {
                      label: "payload.typ",
                      value: formatJsonValue(selectedItem.payload.typ),
                      icon: <Activity className="h-4 w-4" />,
                    },
                    {
                      label: "payload.measure_ts",
                      value: formatDateTime(
                        typeof selectedItem.payload.measure_ts === "string"
                          ? selectedItem.payload.measure_ts
                          : null
                      ),
                      icon: <Waves className="h-4 w-4" />,
                    },
                    {
                      label: "received_at",
                      value: formatDateTime(selectedItem.receivedAtKst),
                      icon: <Radio className="h-4 w-4" />,
                    },
                    {
                      label: "saved_at",
                      value: formatDateTime(selectedItem.savedAtKst),
                      icon: <Database className="h-4 w-4" />,
                    },
                    {
                      label: "eqpmn count",
                      value: String(selectedMeta.eqpmnCount),
                      icon: <Box className="h-4 w-4" />,
                    },
                  ].map((entry) => (
                    <div key={entry.label} className="rounded-2xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {entry.icon}
                        <span>{entry.label}</span>
                      </div>
                      <div className="mt-2 break-all text-sm font-semibold text-slate-900">
                        {entry.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">payload.eqpmn</h2>
                    <p className="text-sm text-muted-foreground">
                      name 과 values를 검증용 상세 테이블로 유지합니다.
                    </p>
                  </div>
                  {selectedMeta.eqpmnItems.length > 0 ? (
                    <div className="overflow-x-auto rounded-2xl border">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">
                              name
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">
                              values
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {selectedMeta.eqpmnItems.map((eqpmn, index) => (
                            <tr key={`${selectedItem.registNo}-${eqpmn.name}-${index}`}>
                              <td className="px-4 py-3 align-top font-medium text-gray-900">
                                {eqpmn.name}
                              </td>
                              <td className="px-4 py-3 align-top text-gray-700">
                                <pre className="whitespace-pre-wrap break-all font-mono text-xs">
                                  {formatJsonValue(eqpmn.values)}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
                      eqpmn 배열이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Farm Focus Queue</CardTitle>
                <p className="text-sm text-muted-foreground">
                  최신 저장 기준 농장 상태 목록
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {latestFarmRows.map((item) => {
                  const meta = getFarmMeta(item, data?.serverNowKst);
                  const isSelected = selectedItem.registNo === item.registNo;

                  return (
                    <Button
                      key={item.registNo}
                      type="button"
                      variant="ghost"
                      className={cn(
                        "h-auto w-full justify-start rounded-2xl border px-4 py-3 text-left",
                        isSelected
                          ? "border-cyan-300 bg-cyan-50 hover:bg-cyan-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      )}
                      onClick={() => setSelectedRegistNo(item.registNo)}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-slate-900">{item.registNo}</div>
                          <Badge
                            className={cn(
                              meta.isFresh
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {meta.isFresh ? "live" : "idle"}
                          </Badge>
                        </div>
                        <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                          칸 {meta.stallNo ?? "-"} · 방 {meta.roomNo ?? "-"}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>eqpmn {meta.eqpmnCount}</span>
                          <span>{formatDateTime(item.savedAtKst)}</span>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
