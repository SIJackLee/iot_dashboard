// FarmSummaryTableSkeleton 컴포넌트

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FarmSummaryTableSkeleton() {
  return (
    <Card>
      <CardContent className="py-4 space-y-3">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
