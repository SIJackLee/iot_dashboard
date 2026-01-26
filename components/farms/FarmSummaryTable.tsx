// FarmSummaryTable 컴포넌트

"use client";

import { memo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FarmSummaryDTO } from "@/types/dto";
import FreshnessBadge from "../common/FreshnessBadge";

interface FarmSummaryTableProps {
  items: FarmSummaryDTO[];
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  highlightRegistNos?: Set<string>;
  visibleColumns?: {
    totalRooms: boolean;
    normal: boolean;
    warn: boolean;
    danger: boolean;
    offline: boolean;
    freshness: boolean;
    lastUpdated: boolean;
  };
}

const FarmSummaryTable = memo(function FarmSummaryTable({
  items,
  sortBy,
  sortDir,
  onSortChange,
  highlightRegistNos,
  visibleColumns,
}: FarmSummaryTableProps) {
  const router = useRouter();

  const handleRowClick = (registNo: string) => {
    router.push(`/farms/${registNo}`);
  };

  const renderSortIcon = (key: string) => {
    if (!onSortChange) return null;
    if (sortBy !== key) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />;
    }
    return sortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
    );
  };

  const headerClassName = (key?: string) =>
    `px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
      key
        ? `cursor-pointer select-none ${
            sortBy === key ? "text-gray-900" : "text-gray-500"
          }`
        : "text-gray-500"
    }`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className={headerClassName("registNo")}
              onClick={() => onSortChange?.("registNo")}
            >
              <div className="inline-flex items-center gap-1">
                농장
                {renderSortIcon("registNo")}
              </div>
            </th>
            {visibleColumns?.totalRooms !== false && (
              <th
                className={headerClassName("totalRooms")}
                onClick={() => onSortChange?.("totalRooms")}
              >
                <div className="inline-flex items-center gap-1">
                  총 방
                  {renderSortIcon("totalRooms")}
                </div>
              </th>
            )}
            {visibleColumns?.normal !== false && <th className={headerClassName()}>정상</th>}
            {visibleColumns?.warn !== false && <th className={headerClassName()}>경고</th>}
            {visibleColumns?.danger !== false && (
              <th
                className={headerClassName("danger")}
                onClick={() => onSortChange?.("danger")}
              >
                <div className="inline-flex items-center gap-1">
                  위험
                  {renderSortIcon("danger")}
                </div>
              </th>
            )}
            {visibleColumns?.offline !== false && (
              <th
                className={headerClassName("offline")}
                onClick={() => onSortChange?.("offline")}
              >
                <div className="inline-flex items-center gap-1">
                  오프라인
                  {renderSortIcon("offline")}
                </div>
              </th>
            )}
            {visibleColumns?.freshness !== false && (
              <th
                className={headerClassName("freshness")}
                onClick={() => onSortChange?.("freshness")}
              >
                <div className="inline-flex items-center gap-1">
                  최신성
                  {renderSortIcon("freshness")}
                </div>
              </th>
            )}
            {visibleColumns?.lastUpdated !== false && (
              <th className={headerClassName()}>마지막 업데이트</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const total = item.normal + item.warn + item.danger + item.offline;
            const state: "normal" | "warn" | "danger" | "offline" =
              item.offline > 0
                ? "offline"
                : item.danger > 0
                ? "danger"
                : item.warn > 0
                ? "warn"
                : "normal";

            return (
              <tr
                key={item.registNo}
                onClick={() => handleRowClick(item.registNo)}
                className={`cursor-pointer odd:bg-white even:bg-gray-50/40 hover:bg-gray-50 transition-colors active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 ${
                  highlightRegistNos?.has(item.registNo)
                    ? "bg-yellow-50"
                    : ""
                }`}
                tabIndex={0}
                role="button"
                aria-label={`농장 ${item.registNo} 상세 보기`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(item.registNo);
                  }
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={
                        state === "normal"
                          ? "h-2 w-2 rounded-full bg-green-500"
                          : state === "warn"
                          ? "h-2 w-2 rounded-full bg-yellow-500"
                          : state === "danger"
                          ? "h-2 w-2 rounded-full bg-red-500"
                          : "h-2 w-2 rounded-full bg-gray-400"
                      }
                    />
                    {item.registNo}
                  </span>
                </td>
                {visibleColumns?.totalRooms !== false && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.totalRooms}
                  </td>
                )}
                {visibleColumns?.normal !== false && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {item.normal}
                  </td>
                )}
                {visibleColumns?.warn !== false && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {item.warn}
                  </td>
                )}
                {visibleColumns?.danger !== false && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {item.danger}
                  </td>
                )}
                {visibleColumns?.offline !== false && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.offline}
                  </td>
                )}
                {visibleColumns?.freshness !== false && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FreshnessBadge freshnessSec={item.freshnessSec} state={state} />
                  </td>
                )}
                {visibleColumns?.lastUpdated !== false && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdatedAtKst
                      ? new Date(item.lastUpdatedAtKst).toLocaleString("ko-KR")
                      : "N/A"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default FarmSummaryTable;
