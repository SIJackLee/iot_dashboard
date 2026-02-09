// MotorControlDemoView - 사내 테스팅용 게임형 UI (조작감 강화)
// isDemoMode 시에만 사용. 실제 제어 로직은 MotorControlPanel에서 처리.

"use client";

import { Button } from "@/components/ui/button";
import { motorLabel, getMotorUnit } from "@/lib/labels";
import type { MotorsDTO } from "@/types/dto";

type MotorKey = "ec01" | "ec02" | "ec03";
const MOTOR_KEYS: MotorKey[] = ["ec01", "ec02", "ec03"];
const SNAP_VALUES = [0, 25, 50, 75, 100] as const;

/** 방안 A: 프리셋별 고정 duration (초/1회전) - 5단계 명확 구분 */
const FAN_DURATIONS: Record<number, number> = {
  0: 0,
  25: 4,
  50: 2,
  75: 1,
  100: 0.4,
};

function snapToNearest(value: number): number {
  let nearest: number = SNAP_VALUES[0];
  let minDist = Math.abs(value - nearest);
  for (const s of SNAP_VALUES) {
    const d = Math.abs(value - s);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return nearest;
}

function getCurrentRpm(motors: MotorsDTO | null | undefined, key: MotorKey): number | null {
  if (!motors) return null;
  const arr = key === "ec01" ? motors.ec01 : key === "ec02" ? motors.ec02 : motors.ec03;
  if (!arr || !Array.isArray(arr) || arr.length === 0) return null;
  const nums = arr.filter((n) => typeof n === "number" && !isNaN(n));
  return nums.length > 0 ? Math.max(...nums) : null;
}

interface MotorControlDemoViewProps {
  sliderValues: Record<MotorKey, number>;
  motors?: MotorsDTO | null;
  onSliderChange: (key: MotorKey, value: number) => void;
  onSliderCommit: (key: MotorKey, value: number) => void;
  onPresetAndSend: (key: MotorKey, pct: number) => void;
  loading: boolean;
  errorMessage: string | null;
  appliedMotor: MotorKey | null;
}

export default function MotorControlDemoView({
  sliderValues,
  motors = null,
  onSliderChange,
  onSliderCommit,
  onPresetAndSend,
  loading,
  errorMessage,
  appliedMotor,
}: MotorControlDemoViewProps) {
  return (
    <div className="space-y-4">
      {/* 3층 구조 - 각 층 상단에 프리셋 */}
      <div className="space-y-3">
        {MOTOR_KEYS.map((k) => (
          <FloorLayer
            key={k}
            motorKey={k}
            label={motorLabel(k)}
            pct={sliderValues[k]}
            currentRpm={getCurrentRpm(motors, k)}
            onSliderChange={(v) => onSliderChange(k, v)}
            onSliderCommit={(v) => onSliderCommit(k, v)}
            onPreset={(pct) => onPresetAndSend(k, pct)}
            loading={loading}
            applied={appliedMotor === k}
          />
        ))}
      </div>
      {errorMessage && (
        <p className="text-sm text-red-600 pt-2">{errorMessage}</p>
      )}
    </div>
  );
}

// 단일 층: 프리셋(상단) + 옵션 A(모바일) / 가로배치(PC) + 층별 전송 버튼
function FloorLayer({
  motorKey,
  label,
  pct,
  currentRpm,
  onSliderChange,
  onSliderCommit,
  onPreset,
  loading,
  applied,
}: {
  motorKey: MotorKey;
  label: string;
  pct: number;
  currentRpm: number | null;
  onSliderChange: (v: number) => void;
  onSliderCommit: (v: number) => void;
  onPreset: (pct: number) => void;
  loading: boolean;
  applied: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, pct));

  // 팬 회전: visualPct를 프리셋으로 스냅 후 FAN_DURATIONS 적용 (방안 A)
  const visualPct = currentRpm != null && currentRpm > 0 ? Math.min(100, (currentRpm / 1500) * 100) : clamped;
  const snappedPct = snapToNearest(visualPct);
  const fanDuration = FAN_DURATIONS[snappedPct] ?? (snappedPct <= 0 ? 0 : 2);

  // 돼지 밀림/기울기 - 목표(슬라이더) 기준
  const pigTilt = (clamped / 100) * 35;
  const pigTranslate = (clamped / 100) * -55;
  const pigShake = clamped >= 50 ? 1 : 0;

  const rpmText = currentRpm != null ? `${currentRpm.toLocaleString()} ${getMotorUnit(motorKey)}` : "—";

  return (
    <div
      className={`rounded-xl border-2 bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm transition-shadow ${
        applied ? "border-green-400 animate-[motor-applied_1.5s_ease-out]" : "border-gray-200"
      }`}
    >
      {/* 프리셋 버튼 (각 팬 상단) */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {SNAP_VALUES.map((pctVal) => (
          <Button
            key={pctVal}
            variant={clamped === pctVal ? "default" : "outline"}
            size="sm"
            onClick={() => onPreset(pctVal)}
            disabled={loading}
            className="min-h-[32px] min-w-[44px] text-xs"
          >
            {pctVal === 0 ? "정지" : `${pctVal}%`}
          </Button>
        ))}
      </div>
      {/* 헤더: 모터명 + 현재 RPM */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-700">
          현재: {rpmText}
        </span>
      </div>

      {/* 모바일(옵션 A): 세로 스택 */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* 돼지 + 팬 행 */}
        <div className="flex justify-between items-center min-h-[100px] py-2">
          <div
            className="flex-shrink-0 select-none transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${pigTranslate}px) rotate(${pigTilt}deg)`,
            }}
          >
            <span
              className="inline-block"
              style={{
                animation: pigShake
                  ? "pig-shake 0.12s ease-in-out infinite alternate"
                  : "none",
              }}
            >
              <img
                src="/images/pig.png"
                alt="돼지"
                className="w-14 h-14 object-contain"
              />
            </span>
          </div>
          <div
            className="w-16 h-16 flex-shrink-0"
            style={
              fanDuration > 0
                ? { animation: `fan-spin ${fanDuration}s linear infinite` }
                : {}
            }
          >
            <FanIcon />
          </div>
        </div>
        {/* 슬라이더 행 */}
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={clamped}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            onMouseUp={() => onSliderCommit(snapToNearest(clamped))}
            onTouchEnd={() => onSliderCommit(snapToNearest(clamped))}
            className="w-full h-11 min-h-[44px] rounded-full appearance-none bg-gray-200 accent-blue-600 cursor-grab active:cursor-grabbing"
          />
          <div className="text-base font-semibold text-gray-600 text-center">
            {Math.round(clamped)}%
          </div>
        </div>
      </div>

      {/* PC: 가로 배치 */}
      <div className="hidden sm:flex items-center gap-4 min-h-[120px]">
        <div className="flex-shrink-0 w-24 flex items-center justify-center">
          <div
            className="select-none transition-transform duration-75 ease-out"
            style={{
              transform: `translateX(${pigTranslate}px) rotate(${pigTilt}deg)`,
            }}
          >
            <span
              className="inline-block"
              style={{
                animation: pigShake
                  ? "pig-shake 0.12s ease-in-out infinite alternate"
                  : "none",
              }}
            >
              <img
                src="/images/pig.png"
                alt="돼지"
                className="w-16 h-16 object-contain"
              />
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-center h-12 opacity-60">
            <div
              className="h-1 rounded-full bg-blue-200 transition-all duration-75"
              style={{
                width: `${20 + (clamped / 100) * 60}%`,
                opacity: 0.3 + (clamped / 100) * 0.5,
              }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={clamped}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            onMouseUp={() => onSliderCommit(snapToNearest(clamped))}
            onTouchEnd={() => onSliderCommit(snapToNearest(clamped))}
            className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-blue-600 cursor-grab active:cursor-grabbing"
          />
          <div className="text-sm font-semibold text-gray-600 text-center">
            {Math.round(clamped)}%
          </div>
        </div>
        <div className="flex-shrink-0 w-24 flex items-center justify-center">
          <div
            className="w-20 h-20 relative"
            style={
              fanDuration > 0
                ? {
                    animation: `fan-spin ${fanDuration}s linear infinite`,
                  }
                : {}
            }
          >
            <FanIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

// CSS 애니메이션용 팬 아이콘 (SVG)
function FanIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full text-blue-500"
      style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
    >
      <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.2" />
      <circle cx="32" cy="32" r="6" fill="currentColor" />
      {/* 4개 블레이드 */}
      <path
        d="M32 8 L36 28 L32 32 L28 28 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M56 32 L36 36 L32 32 L36 28 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M32 56 L28 36 L32 32 L36 36 Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M8 32 L28 28 L32 32 L28 36 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}
