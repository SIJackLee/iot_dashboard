// CriticalAlertBanner - 위험 상태 알림 배너

"use client";

import { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roomLabel, stallLabel } from "@/lib/labels";

interface DangerRoom {
  key12: string;
  stallNo: number;
  roomNo: number;
  registNo?: string;
  dangerCount?: number; // 농장 레벨에서 위험 방 개수
}

interface CriticalAlertBannerProps {
  dangerRooms: DangerRoom[];
  onRoomClick?: (key12: string) => void;
  onDismiss?: () => void;
  dismissable?: boolean;
  isFarmLevel?: boolean; // 농장 레벨 표시 여부
}

export default function CriticalAlertBanner({
  dangerRooms,
  onRoomClick,
  onDismiss,
  dismissable = true,
  isFarmLevel = false,
}: CriticalAlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (dangerRooms.length === 0 || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const displayedRooms = isExpanded ? dangerRooms : dangerRooms.slice(0, 3);
  const hasMore = dangerRooms.length > 3;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icon with pulse animation */}
        <div className="relative flex-shrink-0 mt-0.5">
          <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-50 animate-ping" />
          <AlertTriangle className="relative h-5 w-5 text-red-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-red-800">
              위험 상태 감지 ({dangerRooms.length}개 {isFarmLevel ? "농장" : "방"})
            </h3>
            {dismissable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">닫기</span>
              </Button>
            )}
          </div>

          <p className="text-xs text-red-700 mt-1">
            센서 값이 위험 임계값을 초과했습니다. 즉시 확인이 필요합니다.
          </p>

          {/* Room/Farm List */}
          <div className="mt-3 flex flex-wrap gap-2">
            {displayedRooms.map((room) => (
              <button
                key={room.key12}
                onClick={() => onRoomClick?.(room.key12)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium rounded transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {isFarmLevel ? (
                  <>
                    <span className="font-semibold">{room.registNo}</span>
                    <span className="text-red-600">({room.roomNo}개 위험)</span>
                  </>
                ) : (
                  <>
                    {room.registNo && (
                      <span className="text-red-600">{room.registNo}</span>
                    )}
                    {room.stallNo > 0 && <span>{stallLabel(room.stallNo)}</span>}
                    <span>{roomLabel(room.roomNo)}</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Expand/Collapse */}
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 h-7 text-xs text-red-700 hover:text-red-900 hover:bg-red-100 p-0 px-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  {dangerRooms.length - 3}개 더 보기
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
