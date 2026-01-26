// StatusTimeline 컴포넌트 - 상태 변화 타임라인

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoomLogPointDTO } from "@/types/dto";
import { calculateState } from "@/lib/stateRules";

interface StatusTimelineProps {
  logs: RoomLogPointDTO[];
  offlineThSec?: number;
  height?: number;
}

type RoomState = "normal" | "warn" | "danger" | "offline";

export default function StatusTimeline({
  logs,
  offlineThSec = 300,
  height = 200,
}: StatusTimelineProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>상태 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-10">
            표시할 데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  // 로그를 상태별로 변환
  const timelineData = logs.map((log) => {
    const now = new Date();
    const logTime = new Date(log.measureTsKst);
    const freshnessSec = Math.floor((now.getTime() - logTime.getTime()) / 1000);

    const state = calculateState(
      {
        es01: log.sensors.es01,
        es02: log.sensors.es02,
        es03: log.sensors.es03,
        es04: log.sensors.es04,
        es09: log.sensors.es09,
      },
      offlineThSec,
      freshnessSec
    );

    return {
      time: logTime,
      state,
      timestamp: log.measureTsKst,
    };
  });

  // 상태별 색상
  const stateColors: Record<RoomState, string> = {
    normal: "#22c55e", // green
    warn: "#eab308", // yellow
    danger: "#ef4444", // red
    offline: "#9ca3af", // gray
  };

  // 시간 범위 계산
  const times = timelineData.map((d) => d.time.getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeRange = maxTime - minTime || 1;

  // 상태 구간 계산
  const segments: Array<{
    start: number;
    end: number;
    state: RoomState;
    duration: number;
  }> = [];

  let currentState: RoomState = timelineData[0].state;
  let segmentStart = timelineData[0].time.getTime();

  timelineData.forEach((data, index) => {
    if (data.state !== currentState || index === timelineData.length - 1) {
      const segmentEnd = data.time.getTime();
      segments.push({
        start: segmentStart,
        end: segmentEnd,
        state: currentState,
        duration: segmentEnd - segmentStart,
      });
      currentState = data.state;
      segmentStart = segmentEnd;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>상태 타임라인</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height, position: "relative" }}>
          {/* 타임라인 바 */}
          <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
            {segments.map((segment, index) => {
              const left = ((segment.start - minTime) / timeRange) * 100;
              const width = ((segment.end - segment.start) / timeRange) * 100;

              return (
                <div
                  key={index}
                  className="absolute h-full"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: stateColors[segment.state],
                    opacity: 0.8,
                  }}
                  title={`${new Date(segment.start).toLocaleTimeString("ko-KR")} - ${new Date(segment.end).toLocaleTimeString("ko-KR")}: ${segment.state}`}
                />
              );
            })}
          </div>

          {/* 시간 레이블 */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              {new Date(minTime).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              {new Date(maxTime).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* 범례 */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            {Object.entries(stateColors).map(([state, color]) => (
              <div key={state} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span>
                  {state === "normal"
                    ? "정상"
                    : state === "warn"
                    ? "경고"
                    : state === "danger"
                    ? "위험"
                    : "오프라인"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
