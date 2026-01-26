// TopBar 컴포넌트

"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface TopBarProps {
  summary?: ReactNode;
}

export default function TopBar({ summary }: TopBarProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/farms"
          className="hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="메인 페이지로 이동"
        >
          <h1 className="text-xl font-bold text-gray-800">IoT Dashboard</h1>
        </Link>
        {summary && (
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            {summary}
          </div>
        )}
      </div>
    </header>
  );
}
