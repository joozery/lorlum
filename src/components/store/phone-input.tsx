"use client";

import { useState, useRef, useEffect } from "react";
import "flag-icons/css/flag-icons.min.css";
import { PHONE_CODES, PhoneCode, parsePhoneValue } from "@/lib/phone-codes";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder = "81 234 5678" }: Props) {
  const parsed = parsePhoneValue(value);
  const [selected, setSelected] = useState<PhoneCode>(parsed.code);
  const [number, setNumber]     = useState(parsed.number);
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const wrapRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync from external value only on mount
  useEffect(() => {
    const p = parsePhoneValue(value);
    setSelected(p.code);
    setNumber(p.number);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 30);
  }, [open]);

  const filtered = PHONE_CODES.filter(c =>
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  function selectCode(code: PhoneCode) {
    setSelected(code);
    setOpen(false);
    setSearch("");
    onChange(code.dial + (number ? " " + number : ""));
  }

  function handleNumber(v: string) {
    setNumber(v);
    onChange(selected.dial + (v ? " " + v : ""));
  }

  return (
    <div ref={wrapRef} className="flex items-end relative">
      {/* Flag + dial code trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-10 px-2 pr-3 bg-transparent border-b border-gold/30 font-jost text-[12px] text-espresso whitespace-nowrap cursor-pointer hover:border-gold/50 transition-colors shrink-0"
      >
        <span
          className={`fi fi-${selected.iso2}`}
          style={{ width: 20, height: 14, display: "inline-block", backgroundSize: "cover", borderRadius: 2, flexShrink: 0 }}
        />
        <span className="text-muted">{selected.dial}</span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className={`text-muted/50 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Number input */}
      <input
        value={number}
        onChange={e => handleNumber(e.target.value)}
        placeholder={placeholder}
        inputMode="tel"
        className="flex-1 h-10 border-b border-gold/30 bg-transparent font-jost text-[13px] text-espresso outline-none px-2 placeholder:text-muted/50"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 w-60 bg-cream border border-gold/20 shadow-lg mt-0.5">
          <div className="p-2 border-b border-gold/10">
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="w-full h-8 border border-gold/20 bg-ivory font-jost text-[11px] tracking-wide px-2 outline-none placeholder:text-muted/40"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-[11px] text-muted font-jost">No results</li>
            )}
            {filtered.map(c => (
              <li key={`${c.iso2}-${c.dial}`}>
                <button
                  type="button"
                  onClick={() => selectCode(c)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left font-jost hover:bg-gold/10 transition-colors ${
                    c.iso2 === selected.iso2 ? "bg-gold/10" : ""
                  }`}
                >
                  <span
                    className={`fi fi-${c.iso2}`}
                    style={{ width: 20, height: 14, display: "inline-block", backgroundSize: "cover", borderRadius: 2, flexShrink: 0 }}
                  />
                  <span className="flex-1 truncate text-[12px] text-espresso">{c.country}</span>
                  <span className="text-[11px] text-muted">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
