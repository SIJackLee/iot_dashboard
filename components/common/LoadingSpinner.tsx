// LoadingSpinner 컴포넌트

"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ 
  message = "데이터를 불러오는 중...", 
  size = "md" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-b-2",
    lg: "h-12 w-12 border-b-2",
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div 
        className={`animate-spin rounded-full border-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="로딩 중"
      />
      {message && (
        <p className="mt-4 text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
}
