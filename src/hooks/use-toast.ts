"use client";

import { useState, useCallback } from "react";
import type { ToastVariant } from "@/components/ui/toast";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  open: boolean;
}

let toastQueue: ToastItem[] = [];
let listeners: Array<(toasts: ToastItem[]) => void> = [];

function notify(list: Array<(t: ToastItem[]) => void>, toasts: ToastItem[]) {
  list.forEach((l) => l([...toasts]));
}

export function toast(opts: Omit<ToastItem, "id" | "open">) {
  const duration = opts.duration ?? 3500;
  const item: ToastItem = { ...opts, duration, id: Math.random().toString(36).slice(2), open: true };
  toastQueue = [...toastQueue, item];
  notify(listeners, toastQueue);
  setTimeout(() => {
    toastQueue = toastQueue.map((t) => (t.id === item.id ? { ...t, open: false } : t));
    notify(listeners, toastQueue);
  }, duration + 300);
}

/* Convenience helpers */
toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" });

toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "error" });

toast.info = (title: string, description?: string) =>
  toast({ title, description, variant: "info" });

toast.warning = (title: string, description?: string) =>
  toast({ title, description, variant: "warning" });

export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const subscribe = useCallback(() => {
    const handler = (t: ToastItem[]) => setToasts(t);
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);
  return { toasts, subscribe };
}
