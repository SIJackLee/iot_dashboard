"use client";

import { useCallback, useState } from "react";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  /** 모바일에서만 활성화 (sm 미만) */
  mobileOnly?: boolean;
  threshold?: number;
}

export default function PullToRefresh({
  children,
  onRefresh,
  mobileOnly = true,
  threshold = 80,
}: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (mobileOnly && typeof window !== "undefined" && window.innerWidth >= 640) return;
      if (typeof window !== "undefined" && window.scrollY <= 0) {
        setStartY(e.touches[0].clientY);
      }
    },
    [mobileOnly]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (mobileOnly && typeof window !== "undefined" && window.innerWidth >= 640) return;
      if (refreshing || startY === 0) return;
      const y = e.touches[0].clientY;
      const diff = y - startY;
      if (diff > 0 && window.scrollY <= 0) {
        setPullY(Math.min(diff * 0.5, threshold * 1.5));
      }
    },
    [mobileOnly, refreshing, startY, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (startY === 0) return;
    setStartY(0);
    if (pullY >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  }, [pullY, threshold, refreshing, onRefresh, startY]);

  const progress = Math.min(pullY / threshold, 1);

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullY > 0 && (
        <div
          className="absolute left-0 right-0 top-0 flex justify-center z-30 transition-transform duration-150"
          style={{ transform: `translateY(${Math.min(pullY, 60)}px)` }}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border ${
              refreshing ? "animate-spin" : ""
            }`}
            style={{ opacity: progress }}
          >
            {refreshing ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
