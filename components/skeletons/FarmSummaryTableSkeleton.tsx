// FarmSummaryTableSkeleton 컴포넌트

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FarmSummaryTableSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="py-4 space-y-3">
        <Skeleton className="h-8 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton 
            key={idx} 
            className="h-10 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]"
            style={{ animationDelay: `${idx * 0.1}s` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
