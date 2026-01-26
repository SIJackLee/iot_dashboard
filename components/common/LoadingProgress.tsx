// LoadingProgress 컴포넌트 - 로딩 진행 상태 표시

"use client";

import { useEffect, useState } from "react";

interface LoadingProgressProps {
  isLoading: boolean;
  estimatedTime?: number; // 예상 시간 (초)
}

const LOADING_STAGES = [
  { label: "데이터를 불러오는 중...", progress: 30 },
  { label: "농장 정보를 분석하는 중...", progress: 60 },
  { label: "최종 데이터를 준비하는 중...", progress: 90 },
  { label: "거의 완료되었습니다...", progress: 100 },
];

export default function LoadingProgress({ 
  isLoading, 
  estimatedTime = 10 
}: LoadingProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && startTime === null) {
      setStartTime(Date.now());
      setElapsedTime(0);
      setProgress(0);
      setCurrentStage(0);
    }

    if (!isLoading) {
      if (progress < 100) {
        setProgress(100);
      }
      return;
    }

    // 경과 시간 추적
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // 진행 상태 업데이트
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        
        // 단계별 진행
        const stageProgress = LOADING_STAGES[currentStage]?.progress || 100;
        if (prev < stageProgress) {
          return Math.min(prev + 2, stageProgress);
        } else if (prev >= stageProgress && currentStage < LOADING_STAGES.length - 1) {
          setCurrentStage((prev) => prev + 1);
          return prev;
        }
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(timeInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, currentStage, startTime, progress]);

  if (!isLoading && progress >= 100) {
    return null;
  }

  const currentStageData = LOADING_STAGES[currentStage] || LOADING_STAGES[LOADING_STAGES.length - 1];
  
  // 예상 시간 계산 (경과 시간 기반으로 동적 조정)
  const avgProgressPerSecond = elapsedTime > 0 ? progress / elapsedTime : 0;
  const estimatedRemaining = avgProgressPerSecond > 0 
    ? Math.max(0, Math.ceil((100 - progress) / avgProgressPerSecond))
    : estimatedTime - elapsedTime;
  const remainingTime = estimatedRemaining > 0 ? estimatedRemaining : 0;

  // 로딩이 오래 걸릴 때 안내 메시지
  const showLongLoadingMessage = elapsedTime > estimatedTime * 1.5;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{currentStageData.label}</span>
        <span className="text-gray-500">
          {remainingTime > 0 ? `약 ${remainingTime}초 남음` : "거의 완료..."}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{progress.toFixed(0)}% 완료</span>
        {elapsedTime > 0 && (
          <span>경과 시간: {elapsedTime}초</span>
        )}
      </div>
      {showLongLoadingMessage && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⏱️ 로딩이 예상보다 오래 걸리고 있습니다. 네트워크 상태를 확인해 주세요.
        </div>
      )}
    </div>
  );
}
