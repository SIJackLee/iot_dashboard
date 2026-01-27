// SensorGaugeChart 컴포넌트 - 센서 값 선형 게이지 차트

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sensorLabel, convertSensorValue, getSensorUnit } from "@/lib/labels";

interface SensorGaugeChartProps {
  sensorKey: string;
  value: number; // 원본 값 (x10 스케일 포함)
  thresholds: { warn: number; danger: number; warnLow?: number; dangerLow?: number };
  maxValue?: number; // 게이지 최대값 (기본값: danger * 1.5)
}

export default function SensorGaugeChart({
  sensorKey,
  value,
  thresholds,
  maxValue,
}: SensorGaugeChartProps) {
  const STATE_STYLES = {
    normal: {
      band: "bg-green-500",
      text: "text-green-600",
      marker: "bg-green-600",
      arrow: "border-b-green-600",
    },
    warn: {
      band: "bg-yellow-500",
      text: "text-yellow-600",
      marker: "bg-yellow-600",
      arrow: "border-b-yellow-600",
    },
    danger: {
      band: "bg-red-500",
      text: "text-red-600",
      marker: "bg-red-600",
      arrow: "border-b-red-600",
    },
  } as const;

  const convertedValue = convertSensorValue(sensorKey, value);
  const unit = getSensorUnit(sensorKey);
  const max = maxValue || thresholds.danger * 1.5;
  const warnLowRaw = thresholds.warnLow ?? 0;
  const dangerLowRaw = thresholds.dangerLow ?? 0;
  const warnLow = Math.max(0, Math.min(warnLowRaw, thresholds.warn));
  const dangerLow = Math.max(0, Math.min(dangerLowRaw, warnLow));
  const hasLowThresholds = warnLow > 0 || dangerLow > 0;
  
  // 현재 상태 결정
  const currentState =
    value <= dangerLow
      ? "danger"
      : value <= warnLow
      ? "warn"
      : value >= thresholds.danger
      ? "danger"
      : value >= thresholds.warn
      ? "warn"
      : "normal";

  // 백분율 계산
  const dangerLowPercent = (dangerLow / max) * 100;
  const warnLowPercent = ((warnLow - dangerLow) / max) * 100;
  const normalPercent = ((thresholds.warn - warnLow) / max) * 100;
  const warnPercent = ((thresholds.danger - thresholds.warn) / max) * 100;
  const dangerPercent = ((max - thresholds.danger) / max) * 100;
  const valuePercent = Math.min(100, (value / max) * 100);

  return (
    <Card className="h-full">
      <CardHeader className="pt-3 pb-2">
        <CardTitle className="text-sm font-medium text-center">
          {sensorLabel(sensorKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        {/* 선형 프로그레스 바 */}
        <div className="space-y-2">
          {/* 색상 구간 배경 */}
          <div className="relative">
            <div className="relative h-6 sm:h-7 bg-gray-100 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
              {hasLowThresholds && (
                <div 
                  className={STATE_STYLES.danger.band}
                  style={{ width: `${dangerLowPercent}%` }}
                  title="하한 위험 범위"
                />
              )}
              {hasLowThresholds && (
                <div 
                  className={STATE_STYLES.warn.band}
                  style={{ width: `${warnLowPercent}%` }}
                  title="하한 경고 범위"
                />
              )}
              <div 
                className={STATE_STYLES.normal.band}
                style={{ width: `${normalPercent}%` }}
                title="정상 범위"
              />
              <div 
                className={STATE_STYLES.warn.band}
                style={{ width: `${warnPercent}%` }}
                title="상한 경고 범위"
              />
              <div 
                className={STATE_STYLES.danger.band}
                style={{ width: `${dangerPercent}%` }}
                title="상한 위험 범위"
              />
            </div>
            <div className="absolute inset-0 pointer-events-none">
              {[
                ...(hasLowThresholds ? [dangerLow, warnLow] : []),
                thresholds.warn,
                thresholds.danger,
              ]
                .filter((point) => point > 0 && point < max)
                .map((point, index) => (
                  <div
                    key={`tick-${index}`}
                    className="absolute top-0 h-full w-px bg-white/70"
                    style={{ left: `${(point / max) * 100}%` }}
                  />
                ))}
              </div>
              {/* 현재 값 표시 마커 */}
              <div 
                className={`absolute top-0 h-full w-1 ${STATE_STYLES[currentState].marker} z-10 transition-[left] duration-300 ease-out -translate-x-1/2`}
                style={{ left: `${valuePercent}%` }}
                title={`현재 값: ${convertedValue.toFixed(1)} ${unit}`}
              />
            </div>
            {/* 현재 값 화살표 */}
            <div
              className={`absolute -top-2 h-0 w-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent ${STATE_STYLES[currentState].arrow} transition-[left] duration-300 ease-out -translate-x-1/2`}
              style={{ left: `${valuePercent}%` }}
              aria-hidden="true"
            />
          </div>
          
          {/* 값 및 임계값 표시 */}
          <div className="text-center">
            <div
              className={`text-xl sm:text-2xl font-semibold tracking-tight ${STATE_STYLES[currentState].text} transition-colors duration-300`}
            >
              {convertedValue.toFixed(1)}
              <span className="ml-1 text-xs font-medium text-gray-500">{unit}</span>
            </div>
            <div className="hidden sm:block text-xs text-gray-500 mt-1">
              {hasLowThresholds && (
                <>
                  하한 위험 {convertSensorValue(sensorKey, dangerLow).toFixed(1)} · 하한 경고{" "}
                  {convertSensorValue(sensorKey, warnLow).toFixed(1)} ·{" "}
                </>
              )}
              상한 경고 {convertSensorValue(sensorKey, thresholds.warn).toFixed(1)} · 상한 위험{" "}
              {convertSensorValue(sensorKey, thresholds.danger).toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
