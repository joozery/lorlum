"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      className="print-btn"
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
