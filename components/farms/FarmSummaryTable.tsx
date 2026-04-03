// FarmSummaryTable 컴포넌트

"use client";

import { memo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FarmSummaryDTO } from "@/types/dto";

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
            <th className={headerClassName()}>
              <div className="inline-flex items-center gap-3">
                {visibleColumns?.danger !== false && (
                  <span
                    className="inline-flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => onSortChange?.("danger")}
                    role={onSortChange ? "button" : undefined}
                    tabIndex={onSortChange ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!onSortChange) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSortChange("danger");
                      }
                    }}
                  >
                    위험
                    {renderSortIcon("danger")}
                  </span>
                )}
                {visibleColumns?.offline !== false && (
                  <span
                    className="inline-flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => onSortChange?.("offline")}
                    role={onSortChange ? "button" : undefined}
                    tabIndex={onSortChange ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!onSortChange) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSortChange("offline");
                      }
                    }}
                  >
                    오프라인
                    {renderSortIcon("offline")}
                  </span>
                )}
                {visibleColumns?.warn !== false && <span>경고</span>}
                {visibleColumns?.normal !== false && <span>정상</span>}
                {visibleColumns?.totalRooms !== false && (
                  <span
                    className="inline-flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => onSortChange?.("totalRooms")}
                    role={onSortChange ? "button" : undefined}
                    tabIndex={onSortChange ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!onSortChange) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSortChange("totalRooms");
                      }
                    }}
                  >
                    총 방
                    {renderSortIcon("totalRooms")}
                  </span>
                )}
              </div>
            </th>
            <th className={headerClassName()}> </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
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
                  <div className="flex items-center gap-2">
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
                    <div className="min-w-0">
                      <div className="truncate">{item.registNo}</div>
                      {visibleColumns?.totalRooms !== false && (
                        <div className="text-xs text-muted-foreground font-normal">
                          총 방 {item.totalRooms}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-sm">
                      {visibleColumns?.danger !== false && (
                        <span className="text-red-700 font-semibold">
                          위험 {item.danger}
                        </span>
                      )}
                      {visibleColumns?.offline !== false && (
                        <span className="text-gray-700 font-semibold">
                          오프라인 {item.offline}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {visibleColumns?.warn !== false && (
                        <span className="text-yellow-700">경고 {item.warn}</span>
                      )}
                      {visibleColumns?.normal !== false && (
                        <span className="text-green-700">정상 {item.normal}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

export default FarmSummaryTable;
