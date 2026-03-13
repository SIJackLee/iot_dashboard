// PersistentAlertCounter - TopBar에 표시되는 항상 보이는 알림 카운터

"use client";

import { AlertTriangle } from "lucide-react";

interface PersistentAlertCounterProps {
  dangerCount: number;
  warnCount?: number;
  onClick?: () => void;
}

export default function PersistentAlertCounter({
  dangerCount,
  warnCount = 0,
  onClick,
}: PersistentAlertCounterProps) {
  // 위험 또는 경고가 없으면 표시하지 않음
  if (dangerCount === 0 && warnCount === 0) {
    return null;
  }

  const hasDanger = dangerCount > 0;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
        transition-all cursor-pointer
        ${
          hasDanger
            ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200"
        }
      `}
      aria-label={`${dangerCount} danger alerts, ${warnCount} warning alerts`}
    >
      <AlertTriangle
        className={`h-3.5 w-3.5 ${hasDanger ? "animate-pulse text-red-600" : "text-yellow-600"}`}
      />
      <span className="flex items-center gap-1">
        {hasDanger && (
          <span className="flex items-center">
            <span className="font-bold">{dangerCount}</span>
            <span className="text-red-500 ml-0.5">위험</span>
          </span>
        )}
        {hasDanger && warnCount > 0 && (
          <span className="text-gray-400 mx-0.5">/</span>
        )}
        {warnCount > 0 && (
          <span className="flex items-center">
            <span className="font-bold">{warnCount}</span>
            <span className="text-yellow-600 ml-0.5">경고</span>
          </span>
        )}
      </span>
    </button>
  );
}
