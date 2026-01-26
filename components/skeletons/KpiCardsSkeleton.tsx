// KpiCardsSkeleton 컴포넌트

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="animate-pulse">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
