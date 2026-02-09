// RoomCard 컴포넌트

"use client";

import type { RoomSnapshotLiteDTO } from "@/types/dto";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FreshnessBadge from "../common/FreshnessBadge";
import { cn } from "@/lib/utils";
import {
  roomLabel,
  BLOWER_LABEL,
  VENT_FAN_LABEL,
} from "@/lib/labels";

interface RoomCardProps {
  room: RoomSnapshotLiteDTO;
  onClick: () => void;
  dense?: boolean;
  highlighted?: boolean;
}

export default function RoomCard({
  room,
  onClick,
  dense = false,
  highlighted = false,
}: RoomCardProps) {
  const getStateStyles = (state: string) => {
    switch (state) {
      case "normal":
        return "border-green-500 bg-green-50 hover:bg-green-100";
      case "warn":
        return "border-yellow-500 bg-yellow-50 hover:bg-yellow-100";
      case "danger":
        return "border-red-500 bg-red-50 hover:bg-red-100";
      case "offline":
        return "border-gray-400 bg-gray-100 hover:bg-gray-200";
      default:
        return "border-gray-300 bg-white hover:bg-gray-50";
    }
  };

  const getBadgeVariant = (state: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (state) {
      case "normal":
        return "outline";
      case "warn":
        return "outline";
      case "danger":
        return "destructive";
      case "offline":
        return "outline";
      default:
        return "outline";
    }
  };

  const getBadgeClassName = (state: string) => {
    switch (state) {
      case "normal":
        return "bg-green-200 text-green-800 border-green-300";
      case "warn":
        return "bg-yellow-200 text-yellow-800 border-yellow-300";
      case "danger":
        return ""; // destructive variant 사용
      case "offline":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-200 text-gray-800 border-gray-300";
    }
  };

  const getDotClassName = (state: string) => {
    switch (state) {
      case "normal":
        return "bg-green-500";
      case "warn":
        return "bg-yellow-500";
      case "danger":
        return "bg-red-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer hover:shadow-md transition-all border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400",
        highlighted ? "ring-2 ring-yellow-200 animate-pulse" : "",
        getStateStyles(room.state)
      )}
      tabIndex={0}
      role="button"
      aria-label={`${roomLabel(room.roomNo)} 상세 보기`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className={dense ? "p-3" : "p-4"}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span
              className={cn("h-2.5 w-2.5 rounded-full", getDotClassName(room.state))}
              aria-hidden="true"
            />
            {roomLabel(room.roomNo)}
          </h3>
          <Badge
            variant={getBadgeVariant(room.state)}
            className={cn(getBadgeClassName(room.state))}
          >
            {room.state.toUpperCase()}
          </Badge>
        </div>
        {dense ? (
          <div className="text-sm text-gray-600">
            <FreshnessBadge freshnessSec={room.freshnessSec} state={room.state} />
          </div>
        ) : (
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              {BLOWER_LABEL}: {room.blowerCount}, {VENT_FAN_LABEL}: {room.ventCount}
            </div>
            <div className="mt-2">
              <FreshnessBadge freshnessSec={room.freshnessSec} state={room.state} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
