// SensorGaugeChart 컴포넌트 - 센서 값 게이지 차트

"use client";

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Cell,
} from "recharts";
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
  
  // 게이지 데이터 구성 (0도부터 시작하는 반원)
  const gaugeData = [
    {
      name: "normal",
      value: Math.min(thresholds.warn, max),
      fill: "#22c55e", // green
    },
    {
      name: "warn",
      value: Math.min(thresholds.danger - thresholds.warn, max - thresholds.warn),
      fill: "#eab308", // yellow
    },
    {
      name: "danger",
      value: Math.max(0, max - thresholds.danger),
      fill: "#ef4444", // red
    },
  ];

  // 현재 값의 색상 결정
  const getCurrentColor = () => {
    if (value >= thresholds.danger) return "#ef4444"; // red
    if (value >= thresholds.warn) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  // 현재 값의 각도 계산 (0-180도, 반원)
  const currentAngle = Math.min(180, (value / max) * 180);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-center">
          {sensorLabel(sensorKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="80%"
              innerRadius="40%"
              outerRadius="90%"
              barSize={20}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={4}
                fill="#e5e7eb"
                background
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RadialBar>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
          <div
            className="text-2xl font-bold"
            style={{ color: getCurrentColor() }}
          >
            {convertedValue.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">{unit}</div>
          <div className="text-xs text-gray-400 mt-2">
            경고: {convertSensorValue(sensorKey, thresholds.warn).toFixed(1)} / 위험: {convertSensorValue(sensorKey, thresholds.danger).toFixed(1)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
