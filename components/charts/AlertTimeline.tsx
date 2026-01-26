// AlertTimeline 컴포넌트 - 알람 발생 타임라인

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface AlertEvent {
  id: string;
  timestamp: string;
  type: "danger" | "warn" | "info";
  message: string;
  roomKey?: string;
  farmRegistNo?: string;
}

interface AlertTimelineProps {
  alerts: AlertEvent[];
  height?: number;
}

export default function AlertTimeline({
  alerts,
  height = 400,
}: AlertTimelineProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>알람 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-10">
            표시할 알람이 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  // 시간순 정렬
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 시간별 그룹화
  const groupedByDate = sortedAlerts.reduce((acc, alert) => {
    const date = new Date(alert.timestamp).toLocaleDateString("ko-KR");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(alert);
    return acc;
  }, {} as Record<string, AlertEvent[]>);

  const getIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "warn":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-red-500 bg-red-50";
      case "warn":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>알람 타임라인</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height, overflowY: "auto" }} className="space-y-4">
          {Object.entries(groupedByDate).map(([date, dateAlerts]) => (
            <div key={date}>
              <div className="sticky top-0 bg-white py-2 font-semibold text-sm text-gray-700 border-b">
                {date}
              </div>
              <div className="mt-2 space-y-2">
                {dateAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded border-l-4 ${getColor(
                      alert.type
                    )}`}
                  >
                    <div className="mt-0.5">{getIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                        {alert.roomKey && (
                          <span className="ml-2">방: {alert.roomKey}</span>
                        )}
                        {alert.farmRegistNo && (
                          <span className="ml-2">농장: {alert.farmRegistNo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
