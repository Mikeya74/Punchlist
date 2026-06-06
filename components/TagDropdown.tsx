"use client";
import { useState, useRef, useEffect } from "react";
import { T, pal } from "@/lib/theme";
import type { Item } from "@/lib/types";

interface Props {
  trades: string[];
  selected: string | null;
  onSelect: (t: string | null) => void;
  allItems: Item[];
}

export function TagDropdown({ trades, selected, onSelect, allItems }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const available = trades.filter(t => allItems.some(i => i.trade === t));
  if (!available.length) return null;
  const p = selected ? pal(selected, trades) : null;

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8,
          border:`1px solid ${selected ? T.borderStrong : T.border}`,
          background: selected && p ? p.bg : T.surface,
          color: selected && p ? p.text : T.textMuted,
          fontSize:13, fontWeight:500, cursor:"pointer" }}>
        {selected ? <><span style={{ width:6, height:6, borderRadius:"50%", background: p!.dot }} />{selected}</> : "Filter by trade"}
        <span style={{ fontSize:10, opacity:0.6 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, zIndex:200, minWidth:180, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
          {selected && (
            <div onClick={() => { onSelect(null); setOpen(false); }}
              style={{ padding:"8px 14px", cursor:"pointer", fontSize:13, color:T.textMuted, borderBottom:`1px solid ${T.border}` }}
              onMouseEnter={e => (e.currentTarget.style.background = T.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              Clear filter
            </div>
          )}
          {available.map((t, i) => { const pp = pal(t, trades); return (
            <div key={t} onClick={() => { onSelect(t); setOpen(false); }}
              style={{ padding:"8px 14px", cursor:"pointer", fontSize:13, color:T.text,
                display:"flex", alignItems:"center", gap:8,
                borderRadius: i === available.length - 1 ? "0 0 8px 8px" : "0" }}
              onMouseEnter={e => (e.currentTarget.style.background = T.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:pp.dot }} />{t}
            </div>
          );})}
        </div>
      )}
    </div>
  );
}