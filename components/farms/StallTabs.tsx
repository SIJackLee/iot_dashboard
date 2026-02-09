// StallTabs 컴포넌트 - 조회 가능한 데이터가 있는 축사만 탭 표시

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stallLabel } from "@/lib/labels";

interface StallInfo {
  stallNo: number;
  rooms: unknown[];
}

interface StallTabsProps {
  stalls: StallInfo[];
  currentStall: number;
  onStallChange: (stallNo: number) => void;
  sticky?: boolean;
}

export default function StallTabs({
  stalls,
  currentStall,
  onStallChange,
  sticky = false,
}: StallTabsProps) {
  const stallNos = stalls.map((s) => s.stallNo).sort((a, b) => a - b);

  if (stallNos.length === 0) return null;

  return (
    <div
      className={
        sticky
          ? "sticky top-0 z-20 -mx-4 px-4 py-2 bg-gray-50/95 backdrop-blur border-b"
          : ""
      }
    >
      <Tabs
        value={currentStall.toString()}
        onValueChange={(value) => onStallChange(parseInt(value, 10))}
        className="mb-4"
      >
        <TabsList>
          {stallNos.map((no) => (
            <TabsTrigger key={no} value={no.toString()}>
              {stallLabel(no)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
