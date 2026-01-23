// FarmSummaryFilters 컴포넌트

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FarmSummaryFiltersProps {
  onSearchChange?: (value: string) => void;
  onSortChange?: (sortBy: string) => void;
}

export default function FarmSummaryFilters({
  onSearchChange,
  onSortChange,
}: FarmSummaryFiltersProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("registNo");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange?.(value);
  };

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-md sm:border sm:bg-background sm:divide-x sm:divide-border">
      <div className="flex-1 sm:px-3 sm:py-2">
        <Input
          type="text"
          placeholder="농장 검색..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1 sm:border-0 sm:shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="sm:px-3 sm:py-2">
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px] sm:border-0 sm:shadow-none focus:ring-0">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="registNo">농장 번호</SelectItem>
            <SelectItem value="totalRooms">총 방 수</SelectItem>
            <SelectItem value="offline">오프라인 수</SelectItem>
            <SelectItem value="danger">위험 수</SelectItem>
            <SelectItem value="freshness">최신성</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
