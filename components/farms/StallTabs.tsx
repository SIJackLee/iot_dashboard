// StallTabs 컴포넌트

"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stallLabel } from "@/lib/labels";

interface StallTabsProps {
  currentStall: number;
  onStallChange: (stallNo: number) => void;
  sticky?: boolean;
}

export default function StallTabs({
  currentStall,
  onStallChange,
  sticky = false,
}: StallTabsProps) {
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
          <TabsTrigger value="1">{stallLabel(1)}</TabsTrigger>
          <TabsTrigger value="2">{stallLabel(2)}</TabsTrigger>
          <TabsTrigger value="3">{stallLabel(3)}</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
