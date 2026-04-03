// OfflineBanner 컴포넌트 - 전부 오프라인 시 표시

"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OfflineBannerProps {
  lastUpdatedAtKst: string | null;
  totalOffline: number;
  totalRooms: number;
  compact?: boolean;
}

export default function OfflineBanner({
  lastUpdatedAtKst,
  totalOffline,
  totalRooms,
  compact = false,
}: OfflineBannerProps) {
  // 전부 오프라인인지 확인
  if (totalOffline < totalRooms) {
    return null;
  }

  const lastUpdateText = lastUpdatedAtKst
    ? new Date(lastUpdatedAtKst).toLocaleString("ko-KR")
    : "알 수 없음";

  return (
    <Alert
      variant="destructive"
      className={compact ? "py-2 px-3" : "mb-6"}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className={compact ? "text-sm leading-5" : undefined}>
        데이터 수신 중단
      </AlertTitle>
      <AlertDescription>
        {compact ? (
          <>
            마지막 업데이트: <span className="font-medium">{lastUpdateText}</span>
          </>
        ) : (
          <>최근 데이터 수신이 중단되었습니다. (마지막 업데이트: {lastUpdateText})</>
        )}
      </AlertDescription>
    </Alert>
  );
}
