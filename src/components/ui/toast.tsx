"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-5 right-5 z-[100] flex max-h-screen w-full max-w-[340px] flex-col gap-2.5",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

export type ToastVariant = "default" | "success" | "error" | "info" | "warning";

const variantConfig: Record<ToastVariant, {
  strip: string;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType | null;
  progress: string;
}> = {
  default: {
    strip:     "bg-gray-300",
    iconBg:    "bg-gray-100",
    iconColor: "text-gray-500",
    icon:      null,
    progress:  "bg-gray-300",
  },
  success: {
    strip:     "bg-emerald-500",
    iconBg:    "bg-emerald-50",
    iconColor: "text-emerald-500",
    icon:      CheckCircle2,
    progress:  "bg-emerald-500",
  },
  error: {
    strip:     "bg-red-500",
    iconBg:    "bg-red-50",
    iconColor: "text-red-500",
    icon:      AlertCircle,
    progress:  "bg-red-500",
  },
  info: {
    strip:     "bg-blue-500",
    iconBg:    "bg-blue-50",
    iconColor: "text-blue-500",
    icon:      Info,
    progress:  "bg-blue-500",
  },
  warning: {
    strip:     "bg-amber-400",
    iconBg:    "bg-amber-50",
    iconColor: "text-amber-500",
    icon:      AlertTriangle,
    progress:  "bg-amber-400",
  },
};

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
  title?: string;
  description?: string;
  duration?: number;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ className, variant = "default", title, description, duration = 3000, ...props }, ref) => {
    const cfg = variantConfig[variant];
    const Icon = cfg.icon;

    return (
      <ToastPrimitive.Root
        ref={ref}
        duration={duration}
        className={cn(
          "group relative flex w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
          "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-4",
          "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
          "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:animate-out",
          className
        )}
        {...props}
      >
        {/* Left accent strip */}
        <div className={cn("w-1 flex-shrink-0", cfg.strip)} />

        {/* Content */}
        <div className="flex flex-1 items-start gap-3 px-4 py-3.5">
          {Icon && (
            <div className={cn("mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", cfg.iconBg)}>
              <Icon className={cn("h-4 w-4", cfg.iconColor)} />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            {title && (
              <ToastPrimitive.Title className="text-sm font-semibold text-gray-900 leading-tight">
                {title}
              </ToastPrimitive.Title>
            )}
            {description && (
              <ToastPrimitive.Description className={cn("text-xs text-gray-500 leading-relaxed", title && "mt-0.5")}>
                {description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="ml-1 mt-0.5 flex-shrink-0 rounded-md p-1 text-gray-300 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100">
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </div>

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-1 right-0 h-[2px] bg-gray-100 overflow-hidden">
          <div
            className={cn("h-full origin-left", cfg.progress)}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </ToastPrimitive.Root>
    );
  }
);
Toast.displayName = "Toast";

export { ToastProvider, ToastViewport, Toast };
