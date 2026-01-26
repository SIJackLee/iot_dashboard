// SensorGaugeChart 컴포넌트 - 센서 값 선형 게이지 차트

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sensorLabel, convertSensorValue, getSensorUnit } from "@/lib/labels";

interface SensorGaugeChartProps {
  sensorKey: string;
  value: number; // 원본 값 (x10 스케일 포함)
  thresholds: { warn: number; danger: number };
  maxValue?: number; // 게이지 최대값 (기본값: danger * 1.5)
}

export default function SensorGaugeChart({
  sensorKey,
  value,
  thresholds,
  maxValue,
}: SensorGaugeChartProps) {
  const convertedValue = convertSensorValue(sensorKey, value);
  const unit = getSensorUnit(sensorKey);
  const max = maxValue || thresholds.danger * 1.5;
  
  // 현재 값의 색상 결정
  const getCurrentColor = () => {
    if (value >= thresholds.danger) return "#ef4444"; // red
    if (value >= thresholds.warn) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  // 백분율 계산
  const normalPercent = (thresholds.warn / max) * 100;
  const warnPercent = ((thresholds.danger - thresholds.warn) / max) * 100;
  const dangerPercent = ((max - thresholds.danger) / max) * 100;
  const valuePercent = Math.min(100, (value / max) * 100);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-center">
          {sensorLabel(sensorKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 선형 프로그레스 바 */}
        <div className="space-y-2">
          {/* 색상 구간 배경 */}
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div 
                className="bg-green-500" 
                style={{ width: `${normalPercent}%` }}
                title="정상 범위"
              />
              <div 
                className="bg-yellow-500" 
                style={{ width: `${warnPercent}%` }}
                title="경고 범위"
              />
              <div 
                className="bg-red-500" 
                style={{ width: `${dangerPercent}%` }}
                title="위험 범위"
              />
            </div>
            {/* 현재 값 표시 (검은색 마커) */}
            <div 
              className="absolute top-0 h-full w-1 bg-black z-10"
              style={{ left: `${valuePercent}%`, marginLeft: '-2px' }}
              title={`현재 값: ${convertedValue.toFixed(1)} ${unit}`}
            />
          </div>
          
          {/* 값 및 임계값 표시 */}
          <div className="text-center">
            <div
              className="text-xl font-bold"
              style={{ color: getCurrentColor() }}
            >
              {convertedValue.toFixed(1)} {unit}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              경고: {convertSensorValue(sensorKey, thresholds.warn).toFixed(1)} / 위험: {convertSensorValue(sensorKey, thresholds.danger).toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
