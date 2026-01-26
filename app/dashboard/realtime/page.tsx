// 실시간 대시보드 페이지

"use client";

import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/shell/TopBar";
import SensorGaugeGrid from "@/components/charts/SensorGaugeGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoomSnapshotFullDTO } from "@/types/dto";

async function fetchRoomFull(key12: string): Promise<RoomSnapshotFullDTO> {
  const res = await fetch(`/api/rooms/${key12}`);
  if (!res.ok) {
    throw new Error("Failed to fetch room full");
  }
  return res.json();
}

export default function RealtimeDashboardPage() {
  // 예시: 첫 번째 방의 데이터를 가져옴 (실제로는 여러 방 선택 가능)
  const sampleKey12 = "FARM01010101"; // 실제로는 사용자가 선택한 방들

  const { data, isLoading } = useQuery({
    queryKey: ["room-full", sampleKey12],
    queryFn: () => fetchRoomFull(sampleKey12),
    refetchInterval: 5000, // 5초마다 갱신
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">실시간 대시보드</h1>
          <div className="text-center text-gray-500">로딩 중...</div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">실시간 대시보드</h1>
          <div className="text-center text-gray-500">데이터가 없습니다.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">실시간 대시보드</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 센서 게이지 그리드 */}
          <Card>
            <CardHeader>
              <CardTitle>센서 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorGaugeGrid sensors={data.sensors} />
            </CardContent>
          </Card>

          {/* 트렌드 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>실시간 트렌드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                최근 데이터를 표시합니다. (실제 구현 시 로그 데이터 필요)
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
