// TopBar 컴포넌트

"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
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

type MeResponse = {
  email: string | null;
  role: "admin" | "farmer" | "viewer" | null;
};

function roleBadgeClass(role: MeResponse["role"]): string {
  if (role === "admin") return "bg-purple-100 text-purple-700 border-purple-200";
  if (role === "farmer") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (role === "viewer") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
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
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: MeResponse | null) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        // 표시용일 뿐 실패해도 기존 UI 동작에 영향 없음
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isLoggedIn = !!me?.email;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
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
        <div className="flex items-center gap-3 min-w-0">
          {summary && (
            <>
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                {summary}
              </div>
              <div className="flex sm:hidden items-center gap-2 text-[11px] text-muted-foreground max-w-[40%] truncate">
                {summary}
              </div>
            </>
          )}
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span
                  className="text-xs text-gray-700 max-w-[160px] truncate"
                  title={me?.email ?? undefined}
                >
                  {me?.email}
                </span>
                {me?.role && (
                  <span
                    className={`mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium ${roleBadgeClass(
                      me.role
                    )}`}
                  >
                    {me.role}
                  </span>
                )}
              </div>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
