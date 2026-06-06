"use client";
import { T, pal } from "@/lib/theme";

interface Props {
  trades: string[];
  selected: string | null;
  onSelect: (t: string) => void;
  compact?: boolean;
}

export function TagPicker({ trades, selected, onSelect, compact }: Props) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop: compact ? 4 : 6 }}>
      {trades.map(t => {
        const p = pal(t, trades); const active = selected === t;
        return (
          <span key={t} onMouseDown={e => { e.preventDefault(); onSelect(t); }}
            style={{ display:"inline-flex", alignItems:"center", gap:4, background: active ? p.bg : "transparent",
              color: active ? p.text : T.textMuted, border:`1px solid ${active ? p.dot+"55" : T.border}`,
              borderRadius:6, fontSize:11, padding:"3px 8px", fontWeight:500, cursor:"pointer", userSelect:"none" }}>
            <span style={{ width:5, height:5, borderRadius:"50%", background: active ? p.dot : T.textFaint, display:"inline-block" }} />
            {t}
          </span>
        );
      })}
    </div>
  );
}