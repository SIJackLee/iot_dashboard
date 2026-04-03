// TopBar 컴포넌트

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import LiveIndicator from "@/components/common/LiveIndicator";
import PersistentAlertCounter from "@/components/common/PersistentAlertCounter";

interface TopBarProps {
  summary?: ReactNode;
  banner?: ReactNode;
  lastUpdatedAt?: string | null;
  isConnected?: boolean;
  pollingInterval?: number;
  dangerCount?: number;
  warnCount?: number;
  onAlertClick?: () => void;
}

export default function TopBar({
  summary,
  banner,
  lastUpdatedAt,
  isConnected = true,
  pollingInterval = 3000,
  dangerCount = 0,
  warnCount = 0,
  onAlertClick,
}: TopBarProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/farms"
            className="hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="메인 페이지로 이동"
          >
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">IoT Dashboard</h1>
          </Link>
          <LiveIndicator
            lastUpdatedAt={lastUpdatedAt}
            isConnected={isConnected}
            pollingInterval={pollingInterval}
          />
          {banner && (
            <div className="hidden lg:block min-w-0">
              {banner}
            </div>
          )}
          <PersistentAlertCounter
            dangerCount={dangerCount}
            warnCount={warnCount}
            onClick={onAlertClick}
          />
        </div>
        {summary && (
          <>
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
              {summary}
            </div>
            <div className="flex sm:hidden items-center gap-2 text-[11px] text-muted-foreground max-w-[50%] truncate">
              {summary}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
