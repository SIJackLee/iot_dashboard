"use client";

import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, Database, Factory, Radio, Tag } from "lucide-react";
import TopBar from "@/components/shell/TopBar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <main className="container mx-auto px-4 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>JSON 데이터 조회 실패</AlertTitle>
            <AlertDescription>
              최신 JSON Raw 데이터를 불러오지 못했습니다.
            </AlertDescription>
          </Alert>
        )}

        <section className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">JSON v2 Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            `iot_room_state_json_raw` 최신 200건 기준 모니터링
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
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-72 animate-pulse bg-white" />
              ))}
            </div>
          ) : latestFarmRows.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                표시할 JSON Raw 데이터가 없습니다.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {latestFarmRows.map((item) => (
                <Card key={item.registNo} className="overflow-hidden shadow-sm">
                  <details className="group">
                    <summary className="list-none cursor-pointer p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-900">
                              {item.registNo}
                            </h2>
                            <Badge variant="outline">{item.topic}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            최신 저장 기준 1건 요약
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>eqpmn {item.payload.eqpmn?.length ?? 0}</span>
                          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div className="rounded-lg border bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">topic</div>
                          <div className="mt-1 break-all font-medium text-gray-900">
                            {item.topic}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">payload.typ</div>
                          <div className="mt-1 font-medium text-gray-900">
                            {formatJsonValue(item.payload.typ)}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">payload.seq</div>
                          <div className="mt-1 font-medium text-gray-900">
                            {formatJsonValue(item.payload.seq)}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">payload.measure_ts</div>
                          <div className="mt-1 font-medium text-gray-900">
                            {formatDateTime(item.payload.measure_ts)}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">received_at</div>
                          <div className="mt-1 font-medium text-gray-900">
                            {formatDateTime(item.receivedAtKst)}
                          </div>
                        </div>
                        <div className="rounded-lg border bg-gray-50 p-3">
                          <div className="text-xs text-gray-500">saved_at</div>
                          <div className="mt-1 font-medium text-gray-900">
                            {formatDateTime(item.savedAtKst)}
                          </div>
                        </div>
                      </div>
                    </summary>

                    <div className="border-t bg-white px-6 pb-6 pt-4">
                      <div className="mb-3 text-sm font-medium text-gray-800">
                        payload.eqpmn
                      </div>
                      {item.payload.eqpmn && item.payload.eqpmn.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border">
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
                              {item.payload.eqpmn.map((eqpmn, index) => (
                                <tr key={`${item.registNo}-${eqpmn.name}-${index}`}>
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
                        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                          eqpmn 배열이 없습니다.
                        </div>
                      )}
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
