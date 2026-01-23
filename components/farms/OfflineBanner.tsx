// OfflineBanner 컴포넌트 - 전부 오프라인 시 표시

"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OfflineBannerProps {
  lastUpdatedAtKst: string | null;
  totalOffline: number;
  totalRooms: number;
}

export default function OfflineBanner({
  lastUpdatedAtKst,
  totalOffline,
  totalRooms,
}: OfflineBannerProps) {
  // 전부 오프라인인지 확인
  if (totalOffline < totalRooms) {
    return null;
  }

  const lastUpdateText = lastUpdatedAtKst
    ? new Date(lastUpdatedAtKst).toLocaleString("ko-KR")
    : "알 수 없음";

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>데이터 수신 중단</AlertTitle>
      <AlertDescription>
        최근 데이터 수신이 중단되었습니다. (마지막 업데이트: {lastUpdateText})
      </AlertDescription>
    </Alert>
  );
}
