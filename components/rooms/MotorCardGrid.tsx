"use client";

import type { MotorsDTO, RoomLogPointDTO, RoomState } from "@/types/dto";
import MotorCard from "./MotorCard";

type MotorKey = "ec01" | "ec02" | "ec03";

interface MotorCardGridProps {
  motors: MotorsDTO;
  logs?: RoomLogPointDTO[];
  /** 추후 확장용 (이번 단계에서는 미사용) */
  maxRpm?: Partial<Record<MotorKey, number>>;
  onSelectMotor?: (motorKey: MotorKey) => void;
  /** 오프라인이면 카드에서 RPM·스파크라인 마스킹 */
  roomState?: RoomState;
}

const MOTOR_KEYS: MotorKey[] = ["ec01", "ec02", "ec03"];

function avg(values: number[]): number | null {
  const valid = values.filter((v) => v != null && !Number.isNaN(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function hasValues(arr: unknown): arr is number[] {
  return Array.isArray(arr) && arr.some((v) => typeof v === "number" && !Number.isNaN(v));
}

export default function MotorCardGrid({
  motors,
  logs = [],
  onSelectMotor,
  roomState,
}: MotorCardGridProps) {
  const isOffline = roomState === "offline";

  const getHistory = (key: MotorKey): number[] => {
    if (logs.length === 0) return [];
    return logs
      .map((log) => {
        const values = (log.motors as MotorsDTO)[key] as number[] | null;
        if (!values || values.length === 0) return null;
        const v = avg(values);
        return v == null ? null : v;
      })
      .filter((v): v is number => v !== null);
  };

  const activeKeys = MOTOR_KEYS.filter((key) => {
    const arr = (motors as MotorsDTO)[key] as number[] | null;
    return hasValues(arr);
  });

  if (activeKeys.length === 0) return null;

  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
      {activeKeys.map((key) => (
        <MotorCard
          key={key}
          motorKey={key}
          values={((motors as MotorsDTO)[key] as number[] | null) ?? []}
          history={getHistory(key)}
          showSparkline={logs.length > 0 && !isOffline}
          onClick={onSelectMotor ? () => onSelectMotor(key) : undefined}
          isOffline={isOffline}
        />
      ))}
    </div>
  );
}

