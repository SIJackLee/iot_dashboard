// MotorControlPanel - 모터 명령 전송 (MaxRPM 대비 % 만)

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motorLabel } from "@/lib/labels";

type MotorKey = "ec01" | "ec02" | "ec03";
const MOTOR_KEYS: MotorKey[] = ["ec01", "ec02", "ec03"];

const PRESETS_PCT = [0, 50, 75, 100] as const;

interface MotorControlPanelProps {
  key12: string;
  ventMode?: "exhaust" | "intake";
  blowerCount?: number;
  ventCount?: number;
}

export default function MotorControlPanel({
  key12,
  ventMode = "exhaust",
  blowerCount = 1,
  ventCount = 1,
}: MotorControlPanelProps) {
  const [values, setValues] = useState<Record<MotorKey, string>>({
    ec01: "",
    ec02: "",
    ec03: "",
  });
  const [sliderValues, setSliderValues] = useState<Record<MotorKey, number>>({
    ec01: 0,
    ec02: 0,
    ec03: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusDisplay, setStatusDisplay] = useState<"[명령 전달]" | "[명령 적용]" | "[명령 실패]" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCmdIdRef = useRef<string | null>(null);

  const eqOf = (k: MotorKey): "EC01" | "EC02" | "EC03" =>
    k === "ec01" ? "EC01" : k === "ec02" ? "EC02" : "EC03";

  const applyPreset = (pct: number) => {
    MOTOR_KEYS.forEach((k) => {
      setSliderValues((prev) => ({ ...prev, [k]: pct }));
      setValues((prev) => ({ ...prev, [k]: String(pct) }));
    });
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSend = async () => {
    const actions: { eq: "EC01" | "EC02" | "EC03"; op: "SET_RPM_PCT"; pct: number }[] = [];

    for (const k of MOTOR_KEYS) {
      const v = values[k]?.trim();
      if (!v) continue;

      const pct = parseInt(v, 10);
      if (isNaN(pct) || pct < 0 || pct > 100) continue;
      actions.push({ eq: eqOf(k), op: "SET_RPM_PCT", pct });
    }

    if (actions.length === 0) {
      setErrorMessage("입력된 값이 없습니다. (EC01/EC02/EC03 중 최소 1개)");
      setStatusDisplay(null);
      return;
    }

    setLoading(true);
    setStatusDisplay(null);
    setErrorMessage(null);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    lastCmdIdRef.current = null;

    try {
      const res = await fetch(`/api/rooms/${key12}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions,
          ttl_sec: 10,
          priority: 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || `요청 실패 (${res.status})`);
        setStatusDisplay(null);
        return;
      }

      setStatusDisplay("[명령 전달]");
      const cmdId = data.cmd_id;
      if (cmdId) {
        lastCmdIdRef.current = cmdId;
        pollRef.current = setInterval(async () => {
          try {
            const sres = await fetch(
              `/api/rooms/${key12}/command/status?cmd_id=${encodeURIComponent(cmdId)}`
            );
            const sdata = await sres.json();
            if (sdata.status === "ACKED") {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setStatusDisplay("[명령 적용]");
            } else if (sdata.status === "FAILED") {
              if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
              }
              setStatusDisplay("[명령 실패]");
            }
          } catch {
            // keep polling
          }
        }, 2000);
        setTimeout(() => {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }, 60000);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "전송 중 오류가 발생했습니다.");
      setStatusDisplay(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="font-semibold mb-3 text-sm sm:text-base">모터 제어</h3>
      <div className="space-y-3">
        {/* 프리셋 */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">프리셋:</span>
          {PRESETS_PCT.map((pct) => (
            <Button
              key={pct}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(pct)}
              className="min-w-[52px]"
            >
              {pct === 0 ? "정지" : `${pct}%`}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MOTOR_KEYS.map((k) => (
            <div key={k} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                {motorLabel(k)} (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.min(100, Math.max(0, sliderValues[k]))}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setSliderValues((prev) => ({ ...prev, [k]: n }));
                    setValues((prev) => ({ ...prev, [k]: String(n) }));
                  }}
                  className="flex-1 h-2 rounded-full appearance-none bg-gray-200 accent-blue-600"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  placeholder="0"
                  value={values[k]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setValues((prev) => ({ ...prev, [k]: v }));
                    const n = parseInt(v, 10);
                    if (!isNaN(n) && n >= 0) {
                      setSliderValues((prev) => ({ ...prev, [k]: Math.min(100, n) }));
                    }
                  }}
                  className="h-9 w-20 shrink-0"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleSend}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? "전송 중..." : "명령 전송"}
          </Button>
          {statusDisplay && (
            <span
              className={`text-sm font-medium ${
                statusDisplay === "[명령 적용]"
                  ? "text-green-600"
                  : statusDisplay === "[명령 실패]"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {statusDisplay}
            </span>
          )}
          {errorMessage && (
            <span className="text-sm text-red-600">{errorMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
}
