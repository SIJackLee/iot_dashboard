// /rooms/[key12]/motor - 모터 제어 전용 페이지 (큰 화면)

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Gamepad2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/shell/TopBar";
import MotorControlPanel from "@/components/rooms/MotorControlPanel";
import EmptyState from "@/components/common/EmptyState";
import { roomLabel, stallLabel } from "@/lib/labels";
import type { RoomSnapshotFullDTO } from "@/types/dto";

const DEMO_STORAGE_KEY = "motor-control-demo-mode";

async function fetchRoomFull(key12: string): Promise<RoomSnapshotFullDTO> {
  const res = await fetch(`/api/rooms/${key12}`);
  if (!res.ok) throw new Error("Failed to fetch room");
  return res.json();
}

export default function RoomMotorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const key12 = params.key12 as string;

  const [isDemoMode, setIsDemoMode] = useState(false);
  useEffect(() => {
    const q = searchParams.get("demo");
    if (q === "1" || q === "true") {
      setIsDemoMode(true);
      return;
    }
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored === "1") setIsDemoMode(true);
    } catch {
      // ignore
    }
  }, [searchParams]);

  const toggleDemo = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
  };

  const { data: roomData, isLoading, error } = useQuery({
    queryKey: ["room-full", key12],
    queryFn: () => fetchRoomFull(key12),
    enabled: !!key12,
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
          <div className="flex items-center justify-between gap-2">
            <Button asChild variant="outline" className="min-h-[44px]">
              <Link href={`/rooms/${key12}`}>← 방 상세</Link>
            </Button>
            <Button
              variant={isDemoMode ? "default" : "outline"}
              size="sm"
              onClick={toggleDemo}
              className="gap-2 min-h-[44px]"
            >
              <Gamepad2 className="h-4 w-4" />
              체험 모드 {isDemoMode ? "ON" : "OFF"}
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 shrink-0" />
            모터 제어
          </h1>
          <p className="text-sm text-gray-600">
            {roomLabel(roomData.mapping.roomNo)} · {stallLabel(roomData.mapping.stallNo)}
          </p>
        </div>

        <div
          className={
            isDemoMode
              ? "rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-5 sm:p-6"
              : "bg-white rounded-xl border shadow-sm p-5 sm:p-6"
          }
        >
          <MotorControlPanel
            key12={roomData.mapping.key12}
            ventMode={roomData.mapping.ventMode}
            blowerCount={roomData.mapping.blowerCount}
            ventCount={roomData.mapping.ventCount}
            isDemoMode={isDemoMode}
          />
        </div>
      </main>
    </div>
  );
}
