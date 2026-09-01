"use client";

import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveBarProps {
  onSave?: () => Promise<void> | void;
}

export function SaveBar({ onSave }: SaveBarProps) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  const handleClick = async () => {
    setState("saving");
    await onSave?.();
    setState("saved");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <div className="mt-6 flex justify-end">
      <Button onClick={handleClick} disabled={state === "saving"} className="gap-2 min-w-[140px]">
        {state === "saved" ? (
          <><CheckCircle className="h-4 w-4" /> บันทึกแล้ว</>
        ) : state === "saving" ? (
          <><Save className="h-4 w-4 animate-pulse" /> กำลังบันทึก...</>
        ) : (
          <><Save className="h-4 w-4" /> บันทึกการตั้งค่า</>
        )}
      </Button>
    </div>
  );
}
