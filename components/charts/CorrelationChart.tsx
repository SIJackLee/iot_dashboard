// CorrelationChart 컴포넌트 - 센서 간 상관관계 차트

"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sensorLabel, convertSensorValue } from "@/lib/labels";
import type { SensorsDTO } from "@/types/dto";

interface CorrelationChartProps {
  sensors: SensorsDTO;
  sensorX: string; // X축 센서
  sensorY: string; // Y축 센서
}

export default function CorrelationChart({
  sensors,
  sensorX,
  sensorY,
}: CorrelationChartProps) {
  // 센서 데이터 추출 및 변환
  const getSensorValues = (key: string): number[] => {
    const values = sensors[key as keyof SensorsDTO] as number[];
    if (!values || values.length === 0) return [];
    return values.map((v) => convertSensorValue(key, v));
  };

  const xValues = getSensorValues(sensorX);
  const yValues = getSensorValues(sensorY);

  // 데이터 쌍 생성 (최대값 기준)
  const scatterData = xValues.map((x, index) => ({
    x,
    y: yValues[index] || 0,
  }));

  // 상관계수 계산 (간단한 피어슨 상관계수)
  const calculateCorrelation = () => {
    if (scatterData.length < 2) return 0;

    const n = scatterData.length;
    const sumX = scatterData.reduce((sum, d) => sum + d.x, 0);
    const sumY = scatterData.reduce((sum, d) => sum + d.y, 0);
    const sumXY = scatterData.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = scatterData.reduce((sum, d) => sum + d.x * d.x, 0);
    const sumY2 = scatterData.reduce((sum, d) => sum + d.y * d.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    if (denominator === 0) return 0;
    return numerator / denominator;
  };

  const correlation = calculateCorrelation();

  if (scatterData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>상관관계 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-10">
            표시할 데이터가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {sensorLabel(sensorX)} vs {sensorLabel(sensorY)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            상관계수: <span className="font-semibold">{correlation.toFixed(3)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {correlation > 0.7
              ? "강한 양의 상관관계"
              : correlation > 0.3
              ? "중간 양의 상관관계"
              : correlation > -0.3
              ? "약한 상관관계"
              : correlation > -0.7
              ? "중간 음의 상관관계"
              : "강한 음의 상관관계"}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name={sensorLabel(sensorX)}
                label={{ value: sensorLabel(sensorX), position: "insideBottom", offset: -5 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={sensorLabel(sensorY)}
                label={{ value: sensorLabel(sensorY), angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border rounded shadow px-3 py-2 text-sm">
                        <div>
                          {sensorLabel(sensorX)}: {data.x.toFixed(1)}
                        </div>
                        <div>
                          {sensorLabel(sensorY)}: {data.y.toFixed(1)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#8884d8" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
