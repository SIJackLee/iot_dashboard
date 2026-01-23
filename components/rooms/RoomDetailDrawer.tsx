// RoomDetailDrawer 컴포넌트

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { RoomSnapshotFullDTO } from "@/types/dto";
import SensorsPanel from "./SensorsPanel";
import MotorsPanel from "./MotorsPanel";
import { roomLabel, stallLabel, FARM_LABEL } from "@/lib/labels";

interface RoomDetailDrawerProps {
  room: RoomSnapshotFullDTO | null;
  onClose: () => void;
}

export default function RoomDetailDrawer({
  room,
  onClose,
}: RoomDetailDrawerProps) {
  const router = useRouter();

  if (!room) {
    return null;
  }

  const handleGoToDetailPage = () => {
    router.push(`/rooms/${room.mapping.key12}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-lg">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {roomLabel(room.mapping.roomNo)} 상세
          </h2>
          <Button onClick={onClose} variant="outline" size="sm">
            닫기
          </Button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">기본 정보</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>{FARM_LABEL}: {room.mapping.registNo}</div>
              <div>{stallLabel(room.mapping.stallNo)}</div>
              <div>{roomLabel(room.mapping.roomNo)}</div>
              <div>상태: {room.state.toUpperCase()}</div>
              <div>측정 시간: {new Date(room.timing.measureTsKst).toLocaleString("ko-KR")}</div>
              <div>업데이트: {new Date(room.timing.updatedAtKst).toLocaleString("ko-KR")}</div>
            </div>
          </div>

          <SensorsPanel sensors={room.sensors} />
          <MotorsPanel motors={room.motors} />

          <div className="flex gap-2">
            <Button onClick={handleGoToDetailPage}>
              방 상세 페이지 이동
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
