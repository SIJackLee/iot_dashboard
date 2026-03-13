// LiveIndicator - 실시간 연결 상태 표시

"use client";

import { useEffect, useState } from "react";

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
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!lastUpdatedAt) {
      setSecondsAgo(null);
      return;
    }

    const update = () => {
      const now = new Date();
      const updated = new Date(lastUpdatedAt);
      const diff = Math.floor((now.getTime() - updated.getTime()) / 1000);
      setSecondsAgo(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedAt]);

  const formatTimeAgo = (seconds: number | null): string => {
    if (seconds === null) return "-";
    if (seconds < 5) return "방금";
    if (seconds < 60) return `${seconds}초 전`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    return `${Math.floor(seconds / 3600)}시간 전`;
  };

  const isStale = secondsAgo !== null && secondsAgo > (pollingInterval / 1000) * 3;
  const isOffline = secondsAgo !== null && secondsAgo > 60;

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
