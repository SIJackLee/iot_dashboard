// RoomGrid 컴포넌트

"use client";

import type { RoomSnapshotLiteDTO } from "@/types/dto";
import RoomCard from "./RoomCard";

interface RoomGridProps {
  rooms: RoomSnapshotLiteDTO[];
  onRoomClick: (key12: string) => void;
  dense?: boolean;
  highlightKey12s?: Set<string>;
}

export default function RoomGrid({
  rooms,
  onRoomClick,
  dense = false,
  highlightKey12s,
}: RoomGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${dense ? "gap-3" : "gap-4"}`}>
      {rooms.map((room) => (
        <RoomCard
          key={room.key12}
          room={room}
          dense={dense}
          onClick={() => onRoomClick(room.key12)}
          highlighted={highlightKey12s?.has(room.key12)}
        />
      ))}
    </div>
  );
}
