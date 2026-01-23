// AppShell 컴포넌트

"use client";

import { ReactNode } from "react";
import TopBar from "./TopBar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
