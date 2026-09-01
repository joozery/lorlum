"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/dashboard/sparkline";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  index?: number;
  spark?: number[];
  sparkColor?: string;
  sub?: string;
}

// INSET = how far the icon center sits inside the card corner (diagonally).
// NOTCH_R = distance from card corner to farthest icon edge + breathing gap.
// Farthest icon edge from corner = sqrt(INSET²+INSET²) + ICON_R ≈ INSET*1.41 + ICON_R
const ICON_D  = 44;
const ICON_R  = ICON_D / 2;                           // 22
const INSET   = 22;                                    // icon center 22px inside corner
const WRAP_PAD = Math.max(ICON_R - INSET, 0);         // 0 — no overhang
const NOTCH_R = Math.round(INSET * 1.42 + ICON_R + 12); // ≈ 65 — icon + 12px gap

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "bg-gray-100",
  index = 0,
  spark,
  sparkColor = "#6b7280",
  sub,
}: StatsCardProps) {
  return (
    <div
      style={{
        position: "relative",
        paddingTop: WRAP_PAD,
        paddingLeft: WRAP_PAD,
        filter:
          "drop-shadow(0 1px 3px rgba(0,0,0,0.09)) drop-shadow(0 1px 2px rgba(0,0,0,0.05))",
      }}
    >
      {/* Card — concave notch at top-left sized to match icon circle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.07, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        style={{
          WebkitMask: `radial-gradient(circle ${NOTCH_R}px at 0px 0px, transparent ${NOTCH_R - 1}px, black ${NOTCH_R}px)`,
          mask: `radial-gradient(circle ${NOTCH_R}px at 0px 0px, transparent ${NOTCH_R - 1}px, black ${NOTCH_R}px)`,
          background: "white",
          borderRadius: 20,
          minHeight: 110,
          padding: `${NOTCH_R + 8}px 18px 18px 18px`,
          cursor: "default",
        }}
      >
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          {change && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-semibold pb-0.5",
                changeType === "up" && "text-emerald-600",
                changeType === "down" && "text-red-500",
                changeType === "neutral" && "text-gray-400"
              )}
            >
              {changeType === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
              {changeType === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
              {change}
            </span>
          )}
        </div>

        {spark && spark.length > 0 && (
          <div className="mt-3">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        )}

        {sub && (
          <p className="mt-1 text-[11px] text-gray-400">{sub}</p>
        )}
      </motion.div>

      {/* Circular icon — center aligned to the card's top-left corner */}
      <div
        className={cn(
          "absolute flex items-center justify-center rounded-full",
          iconColor
        )}
        style={{
          top: 0,
          left: 0,
          width: ICON_D,
          height: ICON_D,
        }}
      >
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
    </div>
  );
}
