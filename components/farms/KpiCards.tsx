// KpiCards 컴포넌트

"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardsProps {
  normal: number;
  warn: number;
  danger: number;
  offline: number;
}

export default function KpiCards({
  normal,
  warn,
  danger,
  offline,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            정상
            <span
              title="정상: 경고/위험 조건에 해당하지 않는 상태"
              className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted/40"
            >
              <Info className="h-3 w-3 text-muted-foreground" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{normal}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            경고
            <span
              title="경고: 임계치 접근 상태"
              className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted/40"
            >
              <Info className="h-3 w-3 text-muted-foreground" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{warn}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            위험
            <span
              title="위험: 임계치 초과 상태"
              className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted/40"
            >
              <Info className="h-3 w-3 text-muted-foreground" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{danger}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
            오프라인
            <span
              title="오프라인: 최신 데이터 미수신 상태"
              className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted/40"
            >
              <Info className="h-3 w-3 text-muted-foreground" />
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{offline}</div>
        </CardContent>
      </Card>
    </div>
  );
}
