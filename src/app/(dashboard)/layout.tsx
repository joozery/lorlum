"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { PageTransition } from "@/components/layout/page-transition";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/language-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div
          className="main-content"
          style={{ "--ml": `${collapsed ? 64 : 250}px` } as React.CSSProperties}
        >
          <PageTransition>{children}</PageTransition>
        </div>
        <Toaster />
      </div>
    </LanguageProvider>
  );
}
