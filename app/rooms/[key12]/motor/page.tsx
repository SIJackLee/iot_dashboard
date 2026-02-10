// /rooms/[key12]/motor - 모터 제어 전용 페이지 (체험 모드 고정)

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/shell/TopBar";
import MotorControlPanel from "@/components/rooms/MotorControlPanel";
import EmptyState from "@/components/common/EmptyState";
import { roomLabel, stallLabel } from "@/lib/labels";
import type { RoomSnapshotFullDTO } from "@/types/dto";

async function fetchRoomFull(key12: string): Promise<RoomSnapshotFullDTO> {
  const res = await fetch(`/api/rooms/${key12}`);
  if (!res.ok) throw new Error("Failed to fetch room");
  return res.json();
}

export default function RoomMotorPage() {
  const params = useParams();
  const key12 = params.key12 as string;

  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ["room-full", key12],
    queryFn: () => fetchRoomFull(key12),
    enabled: !!key12,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <div className="animate-pulse rounded-lg bg-gray-200 h-64" />
        </main>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="container mx-auto px-4 py-6">
          <EmptyState
            title="방 정보를 불러올 수 없습니다"
            description="잠시 후 다시 시도해 주세요."
            icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        <div className="mb-4 sm:mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="min-h-[44px]">
              <Link href={`/rooms/${key12}`}>← 방 상세</Link>
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 shrink-0" />
            모터 제어
            {roomData.state === "offline" && (
              <Badge variant="secondary" className="bg-gray-400 text-white shrink-0">
                OFFLINE
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-600">
            {roomLabel(roomData.mapping.roomNo)} · {stallLabel(roomData.mapping.stallNo)}
            {roomData.state === "offline" && (
              <span className="block mt-1 text-gray-500">데이터 갱신 중단 · 적용 여부 확인 불가</span>
            )}
          </p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-5 sm:p-6">
          <MotorControlPanel
            key12={roomData.mapping.key12}
            ventMode={roomData.mapping.ventMode}
            blowerCount={roomData.mapping.blowerCount}
            ventCount={roomData.mapping.ventCount}
            isDemoMode
            motors={roomData.motors}
            roomState={roomData.state}
          />
        </div>
      </main>
    </div>
  );
}
