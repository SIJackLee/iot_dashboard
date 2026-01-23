// EmptyState 컴포넌트

"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center">
        {icon && (
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
        )}
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-sm text-muted-foreground mb-4">{description}</div>
        {actionLabel && onAction && (
          <Button variant="secondary" size="sm" className="min-w-[120px]" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
