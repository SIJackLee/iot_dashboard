// FreshnessBadge 컴포넌트

"use client";

import type { RoomState } from "@/types/dto";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FreshnessBadgeProps {
  freshnessSec: number | null;
  state: RoomState;
}

export default function FreshnessBadge({
  freshnessSec,
  state,
}: FreshnessBadgeProps) {
  if (freshnessSec === null || freshnessSec === Infinity) {
    return (
      <Badge variant="outline" className="bg-gray-200 text-gray-700 border-gray-300">
        N/A
      </Badge>
    );
  }

  const minutes = Math.floor(freshnessSec / 60);
  const seconds = freshnessSec % 60;

  // 상태에 따른 variant 및 스타일 결정
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let customClassName = "";

  if (state === "offline") {
    variant = "outline";
    customClassName = "bg-gray-200 text-gray-700 border-gray-300";
  } else if (state === "danger") {
    variant = "destructive";
  } else if (state === "warn") {
    variant = "outline";
    customClassName = "bg-yellow-100 text-yellow-800 border-yellow-300";
  } else {
    // normal
    variant = "outline";
    customClassName = "bg-green-100 text-green-800 border-green-300";
  }

  return (
    <Badge variant={variant} className={cn(customClassName)}>
      {minutes}m {seconds}s
    </Badge>
  );
}
