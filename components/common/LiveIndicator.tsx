// LiveIndicator - 실시간 연결 상태 표시

"use client";

import { useEffect, useMemo, useState } from "react";

interface LiveIndicatorProps {
  lastUpdatedAt?: string | null;
  isConnected?: boolean;
  pollingInterval?: number; // ms
}

export default function LiveIndicator({
  lastUpdatedAt,
  isConnected = true,
  pollingInterval = 3000,
}: LiveIndicatorProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const secondsAgo = useMemo(() => {
    if (!lastUpdatedAt) return null;
    const updatedMs = new Date(lastUpdatedAt).getTime();
    if (Number.isNaN(updatedMs)) return null;
    return Math.floor((nowMs - updatedMs) / 1000);
  }, [lastUpdatedAt, nowMs]);

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return "-";
    if (seconds < 5) return "방금";
    if (seconds < 60) return `${seconds}초 전`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    return `${Math.floor(seconds / 3600)}시간 전`;
  };

  const isStale = secondsAgo !== null && secondsAgo > (pollingInterval / 1000) * 3;
  const isOffline = secondsAgo !== null && secondsAgo > 600;

  return (
    <div className="flex items-center gap-2">
      {/* Pulse Dot */}
      <div className="relative flex items-center justify-center">
        <span
          className={`absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
            !isConnected || isOffline
              ? "bg-gray-400"
              : isStale
              ? "bg-yellow-400 animate-ping"
              : "bg-green-400 animate-ping"
          }`}
          style={{ animationDuration: "1.5s" }}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            !isConnected || isOffline
              ? "bg-gray-500"
              : isStale
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
        />
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span
          className={`text-xs font-medium ${
            !isConnected || isOffline
              ? "text-gray-500"
              : isStale
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {!isConnected ? "연결 끊김" : isOffline ? "오프라인" : "실시간"}
        </span>
        {lastUpdatedAt && (
          <span className="text-[10px] text-muted-foreground">
            {formatTimeAgo(secondsAgo)}
          </span>
        )}
      </div>
    </div>
  );
}
