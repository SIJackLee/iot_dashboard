// LoadingTips 컴포넌트 - 로딩 중 유용한 팁 표시

"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

const LOADING_TIPS = [
  "💡 팁: 농장을 클릭하면 상세 정보를 확인할 수 있습니다.",
  "📊 실시간 데이터는 15초마다 자동으로 갱신됩니다.",
  "🔍 검색 기능을 사용하여 특정 농장을 빠르게 찾을 수 있습니다.",
  "📱 모바일에서는 핵심 정보만 표시되어 더 빠르게 확인할 수 있습니다.",
  "⚡ 필터 기능을 사용하여 원하는 상태의 농장만 볼 수 있습니다.",
  "📈 차트를 확대하여 상세한 데이터 추이를 확인할 수 있습니다.",
];

export default function LoadingTips() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // 3초마다 팁 변경
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-blue-50 border-blue-200 p-4 mb-6">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-blue-900 font-medium mb-1">로딩 중...</p>
          <p className="text-xs text-blue-700 animate-fade-in">
            {LOADING_TIPS[currentTip]}
          </p>
        </div>
      </div>
    </Card>
  );
}
