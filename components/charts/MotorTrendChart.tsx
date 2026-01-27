// MotorTrendChart 컴포넌트 - 모터 트렌드 차트

"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RoomLogPointDTO } from "@/types/dto";
import { convertMotorValue, getMotorUnit, motorLabel, ventModeLabel } from "@/lib/labels";

type VentMode = "exhaust" | "intake";

const BLOWER_KEYS = ["b1", "b2", "b3", "b4"] as const;
const SECONDARY_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

interface MotorTrendChartProps {
  logs: RoomLogPointDTO[];
  ventMode: VentMode;
  height?: number;
  showTitle?: boolean;
}

const MOTOR_COLORS = {
  ec01: "#ff7300",
  ec02: "#60a5fa",
  ec03: "#34d399",
};

export default function MotorTrendChart({
  logs,
  ventMode,
  height = 260,
  showTitle = true,
}: MotorTrendChartProps) {
  const secondaryKey = ventMode === "intake" ? "ec03" : "ec02";
  const secondaryLabel = motorLabel(secondaryKey);
  const unit = getMotorUnit("ec01");
  const isMobile = typeof window !== "undefined"
    && window.matchMedia("(max-width: 639px)").matches;
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(
    () =>
      isMobile
        ? new Set(["b2", "b3", "b4", "s2", "s3", "s4", "s5", "s6"])
        : new Set()
  );

  const chartData = logs
    .map((log) => {
      const ec01Values = log.motors.ec01 ?? [];
      const secondaryValues = log.motors[secondaryKey] ?? [];
      const blowerSlots = BLOWER_KEYS.map((_, index) => {
        const raw = ec01Values[index];
        return raw == null ? null : convertMotorValue("ec01", raw);
      });
      const secondarySlots = SECONDARY_KEYS.map((_, index) => {
        const raw = secondaryValues[index];
        return raw == null ? null : convertMotorValue(secondaryKey, raw);
      });
      return {
        time: new Date(log.measureTsKst).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        b1: blowerSlots[0],
        b2: blowerSlots[1],
        b3: blowerSlots[2],
        b4: blowerSlots[3],
        s1: secondarySlots[0],
        s2: secondarySlots[1],
        s3: secondarySlots[2],
        s4: secondarySlots[3],
        s5: secondarySlots[4],
        s6: secondarySlots[5],
      };
    })
    .reverse();

  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      {showTitle && (
        <div className="flex items-center justify-between text-sm font-semibold mb-3">
          <span>모터 트렌드</span>
          <span className="text-xs font-medium text-muted-foreground">
            {ventModeLabel(ventMode)}
          </span>
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <button
          type="button"
          onClick={() =>
            setHiddenKeys((prev) => {
              const allHidden = BLOWER_KEYS.every((key) => prev.has(key));
              const next = new Set(prev);
              BLOWER_KEYS.forEach((key) => {
                if (allHidden) next.delete(key);
                else next.add(key);
              });
              return next;
            })
          }
          className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
            BLOWER_KEYS.every((key) => hiddenKeys.has(key)) ? "opacity-40" : ""
          }`}
          title={`송풍 전체 ${BLOWER_KEYS.every((key) => hiddenKeys.has(key)) ? "표시" : "숨김"}`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: MOTOR_COLORS.ec01 }}
          />
          송풍 전체
        </button>
        <button
          type="button"
          onClick={() =>
            setHiddenKeys((prev) => {
              const allHidden = SECONDARY_KEYS.every((key) => prev.has(key));
              const next = new Set(prev);
              SECONDARY_KEYS.forEach((key) => {
                if (allHidden) next.delete(key);
                else next.add(key);
              });
              return next;
            })
          }
          className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
            SECONDARY_KEYS.every((key) => hiddenKeys.has(key)) ? "opacity-40" : ""
          }`}
          title={`${secondaryLabel} 전체 ${
            SECONDARY_KEYS.every((key) => hiddenKeys.has(key)) ? "표시" : "숨김"
          }`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: MOTOR_COLORS[secondaryKey] }}
          />
          {secondaryLabel} 전체
        </button>
        {BLOWER_KEYS.map((key, index) => {
          const hidden = hiddenKeys.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setHiddenKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                })
              }
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
                hidden ? "opacity-40" : ""
              }`}
              title={`${motorLabel("ec01")} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MOTOR_COLORS.ec01 }}
              />
              송풍 {index + 1}
            </button>
          );
        })}
        {SECONDARY_KEYS.map((key, index) => {
          const hidden = hiddenKeys.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setHiddenKeys((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                })
              }
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${
                hidden ? "opacity-40" : ""
              }`}
              title={`${secondaryLabel} ${index + 1} ${hidden ? "표시" : "숨김"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: MOTOR_COLORS[secondaryKey] }}
              />
              {secondaryLabel} {index + 1}
            </button>
          );
        })}
      </div>
      <div className="w-full" style={{ height, minHeight: height }}>
        <ResponsiveContainer
          width="100%"
          height={height}
          minHeight={200}
          minWidth={200}
          debounce={50}
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => {
                const label =
                  String(name).startsWith("b")
                    ? `${motorLabel("ec01")} ${String(name).slice(1)}`
                    : `${secondaryLabel} ${String(name).slice(1)}`;
                return [`${Number(value).toLocaleString()} ${unit}`, label];
              }}
            />
            {BLOWER_KEYS.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={MOTOR_COLORS.ec01}
                  strokeOpacity={1 - index * 0.15}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            )}
            {SECONDARY_KEYS.map((key, index) =>
              hiddenKeys.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={MOTOR_COLORS[secondaryKey]}
                  strokeOpacity={1 - index * 0.12}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
