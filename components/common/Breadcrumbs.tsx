// Breadcrumbs - 네비게이션 브레드크럼

"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1 text-sm text-gray-600 overflow-x-auto ${className}`}
    >
      {/* Home link */}
      <Link
        href="/farms"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">홈</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 hover:underline transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`whitespace-nowrap ${
                  isLast ? "text-gray-900 font-medium" : "text-gray-600"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
