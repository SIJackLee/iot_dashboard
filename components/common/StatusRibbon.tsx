// StatusRibbon - 상단 고정 상태 요약 리본

"use client";

import { AlertTriangle, CheckCircle, AlertCircle, WifiOff } from "lucide-react";

interface StatusRibbonProps {
  danger: number;
  warn: number;
  normal: number;
  offline: number;
  className?: string;
}

export default function StatusRibbon({
  danger,
  warn,
  normal,
  offline,
  className = "",
}: StatusRibbonProps) {
  const total = danger + warn + normal + offline;

  if (total === 0) return null;

  return (
    <div
      className={`w-full bg-gray-900 text-white px-4 py-2 ${className}`}
      role="status"
      aria-label="Room status summary"
    >
      <div className="container mx-auto flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
        {/* Danger */}
        <div
          className={`flex items-center gap-1.5 ${
            danger > 0 ? "text-red-400" : "text-gray-500"
          }`}
        >
          <AlertTriangle
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              danger > 0 ? "animate-pulse" : ""
            }`}
          />
          <span className="font-medium">{danger}</span>
          <span className="hidden sm:inline text-gray-400">위험</span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        {/* Warn */}
        <div
          className={`flex items-center gap-1.5 ${
            warn > 0 ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-medium">{warn}</span>
          <span className="hidden sm:inline text-gray-400">경고</span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        {/* Normal */}
        <div
          className={`flex items-center gap-1.5 ${
            normal > 0 ? "text-green-400" : "text-gray-500"
          }`}
        >
          <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-medium">{normal}</span>
          <span className="hidden sm:inline text-gray-400">정상</span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        {/* Offline */}
        <div
          className={`flex items-center gap-1.5 ${
            offline > 0 ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <WifiOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-medium">{offline}</span>
          <span className="hidden sm:inline text-gray-400">오프라인</span>
        </div>
      </div>
    </div>
  );
}
