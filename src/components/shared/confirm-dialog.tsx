"use client";

import { type LucideIcon, AlertTriangle, Trash2, LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: Variant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}

const variantConfig: Record<Variant, {
  strip: string;
  iconRing: string;
  iconBg: string;
  iconColor: string;
  confirmClass: string;
  defaultIcon: LucideIcon;
}> = {
  danger: {
    strip:       "from-red-500 to-rose-600",
    iconRing:    "ring-red-100",
    iconBg:      "bg-red-50",
    iconColor:   "text-red-500",
    confirmClass:"bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-200 border-transparent",
    defaultIcon: Trash2,
  },
  warning: {
    strip:       "from-amber-400 to-orange-500",
    iconRing:    "ring-amber-100",
    iconBg:      "bg-amber-50",
    iconColor:   "text-amber-500",
    confirmClass:"bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200 border-transparent",
    defaultIcon: AlertTriangle,
  },
  info: {
    strip:       "from-blue-500 to-indigo-600",
    iconRing:    "ring-blue-100",
    iconBg:      "bg-blue-50",
    iconColor:   "text-blue-500",
    confirmClass:"bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 border-transparent",
    defaultIcon: RefreshCw,
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  variant = "danger",
  icon,
  title,
  description,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];
  const Icon = icon ?? cfg.defaultIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs p-0 overflow-hidden gap-0">

        {/* Gradient top strip */}
        <div className={cn("h-1.5 w-full bg-gradient-to-r", cfg.strip)} />

        <div className="flex flex-col items-center px-6 pb-6 pt-7 text-center">

          {/* Icon circle */}
          <div className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-full ring-8",
            cfg.iconBg, cfg.iconRing
          )}>
            <Icon className={cn("h-6 w-6", cfg.iconColor)} />
          </div>

          {/* Text */}
          <p className="text-base font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{description}</p>
          )}

          {/* Divider */}
          <div className="my-5 h-px w-full bg-gray-100" />

          {/* Buttons */}
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1 h-9"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              className={cn("flex-1 h-9", cfg.confirmClass)}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading
                ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                : confirmLabel
              }
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

/* ── Preset helpers ───────────────────────────────── */

export function DeleteConfirmDialog(
  props: Omit<ConfirmDialogProps, "variant" | "icon" | "title"> & { title?: string; itemName?: string }
) {
  return (
    <ConfirmDialog
      {...props}
      variant="danger"
      icon={Trash2}
      title={props.title ?? "ลบรายการนี้?"}
      description={props.description ?? (props.itemName
        ? `"${props.itemName}" จะถูกลบถาวร ไม่สามารถกู้คืนได้`
        : "รายการนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้"
      )}
      confirmLabel={props.confirmLabel ?? "ลบ"}
    />
  );
}

export function LogoutConfirmDialog(props: Omit<ConfirmDialogProps, "variant" | "icon">) {
  return (
    <ConfirmDialog
      {...props}
      variant="warning"
      icon={LogOut}
      title={props.title ?? "ออกจากระบบ?"}
      description={props.description ?? "คุณต้องการออกจากระบบใช่หรือไม่"}
      confirmLabel={props.confirmLabel ?? "ออกจากระบบ"}
    />
  );
}

export function DangerConfirmDialog(props: Omit<ConfirmDialogProps, "variant"> & { icon?: LucideIcon }) {
  return (
    <ConfirmDialog
      {...props}
      variant="danger"
      icon={props.icon ?? ShieldAlert}
    />
  );
}
