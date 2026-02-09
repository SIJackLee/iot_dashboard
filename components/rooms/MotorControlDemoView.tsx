// MotorControlDemoView - 사내 테스팅용 게임형 UI (조작감 강화)
// isDemoMode 시에만 사용. 실제 제어 로직은 MotorControlPanel에서 처리.

"use client";

import { Button } from "@/components/ui/button";
import { motorLabel } from "@/lib/labels";
import { Check, Loader2 } from "lucide-react";

type MotorKey = "ec01" | "ec02" | "ec03";
const MOTOR_KEYS: MotorKey[] = ["ec01", "ec02", "ec03"];
const SNAP_VALUES = [0, 25, 50, 75, 100] as const;

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

interface MotorControlDemoViewProps {
  sliderValues: Record<MotorKey, number>;
  onSliderChange: (key: MotorKey, value: number) => void;
  onSliderCommit: (key: MotorKey, value: number) => void;
  onPreset: (pct: number) => void;
  onSend: () => void;
  loading: boolean;
  statusDisplay: "[명령 전달]" | "[명령 적용]" | "[명령 실패]" | null;
  errorMessage: string | null;
}

export default function MotorControlDemoView({
  sliderValues,
  onSliderChange,
  onSliderCommit,
  onPreset,
  onSend,
  loading,
  statusDisplay,
  errorMessage,
}: MotorControlDemoViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-gray-500 self-center">프리셋:</span>
        {SNAP_VALUES.map((pct) => (
          <Button
            key={pct}
            variant="outline"
            size="sm"
            onClick={() => onPreset(pct)}
            className="min-w-[52px]"
          >
            {pct === 0 ? "정지" : `${pct}%`}
          </Button>
        ))}
      </div>

      {/* 3층 구조 */}
      <div className="space-y-3">
        {MOTOR_KEYS.map((k) => (
          <FloorLayer
            key={k}
            motorKey={k}
            label={motorLabel(k)}
            pct={sliderValues[k]}
            onSliderChange={(v) => onSliderChange(k, v)}
            onSliderCommit={(v) => onSliderCommit(k, v)}
          />
        ))}
      </div>

      {/* 명령 전송 버튼 */}
      <div className="flex items-center gap-2 flex-wrap pt-2">
        <Button
          size="lg"
          onClick={onSend}
          disabled={loading}
          className={`min-w-[140px] gap-2 ${
            statusDisplay === "[명령 적용]"
              ? "bg-green-600 hover:bg-green-700"
              : statusDisplay === "[명령 실패]"
              ? "bg-red-600 hover:bg-red-700"
              : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              전송 중...
            </>
          ) : statusDisplay === "[명령 적용]" ? (
            <>
              <Check className="h-4 w-4" />
              적용됨
            </>
          ) : statusDisplay === "[명령 실패]" ? (
            "실패"
          ) : statusDisplay === "[명령 전달]" ? (
            <>
              <Loader2 className="h-4 w-4 animate-pulse" />
              전달됨
            </>
          ) : (
            "명령 전송"
          )}
        </Button>
        {errorMessage && (
          <span className="text-sm text-red-600">{errorMessage}</span>
        )}
      </div>
    </div>
  );
}

// 단일 층: 돼지(왼쪽) + 바람영역(가운데) + 팬(오른쪽)
function FloorLayer({
  motorKey,
  label,
  pct,
  onSliderChange,
  onSliderCommit,
}: {
  motorKey: MotorKey;
  label: string;
  pct: number;
  onSliderChange: (v: number) => void;
  onSliderCommit: (v: number) => void;
}) {
  const clamped = Math.min(100, Math.max(0, pct));

  // 팬 회전 속도: 0%=정지, 50%=느림, 75%=빠름, 100%=매우빠름
  const fanDuration =
    clamped <= 0 ? 0 : Math.max(0.3, 3 - (clamped / 100) * 2.5);

  // 돼지 밀림/기울기 (0~100%) - 과장된 연출
  const pigTilt = (clamped / 100) * 35; // 0~35deg
  const pigTranslate = (clamped / 100) * -55; // 0~-55px (날아갈 듯)
  const pigShake = clamped >= 50 ? 1 : 0; // 50% 이상에서 흔들림

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 shadow-sm">
      <div className="text-xs font-medium text-gray-500 mb-3">{label}</div>

      <div className="flex items-center gap-2 sm:gap-4 min-h-[120px]">
        {/* 왼쪽: 돼지 */}
        <div className="flex-shrink-0 w-20 sm:w-24 flex items-center justify-center">
          <div
            className="text-5xl sm:text-6xl select-none transition-transform duration-75 ease-out"
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
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
            </span>
          </div>
        </div>

        {/* 가운데: 바람 시각화 + 슬라이더 */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* 바람 라인 (가운데) */}
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
          <div className="text-center text-sm font-semibold text-gray-600">
            {Math.round(clamped)}%
          </div>
        </div>

        {/* 오른쪽: 팬 */}
        <div className="flex-shrink-0 w-20 sm:w-24 flex items-center justify-center">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 relative"
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
