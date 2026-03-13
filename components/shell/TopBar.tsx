// TopBar 컴포넌트

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import LiveIndicator from "@/components/common/LiveIndicator";

interface TopBarProps {
  summary?: ReactNode;
  lastUpdatedAt?: string | null;
  isConnected?: boolean;
  pollingInterval?: number;
}

export default function TopBar({
  summary,
  lastUpdatedAt,
  isConnected = true,
  pollingInterval = 3000,
}: TopBarProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/farms"
            className="hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="메인 페이지로 이동"
          >
            <h1 className="text-xl font-bold text-gray-800">IoT Dashboard</h1>
          </Link>
          {/* Live Indicator */}
          <LiveIndicator
            lastUpdatedAt={lastUpdatedAt}
            isConnected={isConnected}
            pollingInterval={pollingInterval}
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
