"use client";

import { useEffect } from "react";
import { ToastProvider, ToastViewport, Toast } from "@/components/ui/toast";
import { useToastState } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, subscribe } = useToastState();

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, [subscribe]);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          open={t.open}
          title={t.title}
          description={t.description}
          variant={t.variant}
          duration={t.duration}
        />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
