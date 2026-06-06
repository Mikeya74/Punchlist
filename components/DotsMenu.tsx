"use client";
import { useState, useRef, useEffect } from "react";
import { T } from "@/lib/theme";

interface Option { label: string; danger?: boolean; action: () => void; }

export function DotsMenu({ options }: { options: Option[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(v => !v)}
        style={{ border:"none", background:"none", cursor:"pointer", color:T.textFaint, fontSize:18, padding:"2px 6px", borderRadius:6, lineHeight:1 }}>
        ···
      </button>
      {open && (
        <div style={{ position:"absolute", right:0, top:"calc(100% + 4px)", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, zIndex:300, minWidth:160, boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}>
          {options.map((o, i) => (
            <div key={i} onClick={() => { o.action(); setOpen(false); }}
              style={{ padding:"8px 14px", cursor:"pointer", fontSize:13, color: o.danger ? "#DC2626" : T.text,
                borderRadius: i === 0 ? "8px 8px 0 0" : i === options.length - 1 ? "0 0 8px 8px" : "0" }}
              onMouseEnter={e => (e.currentTarget.style.background = T.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}