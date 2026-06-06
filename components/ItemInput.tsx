"use client";
import { useState, useRef } from "react";
import { T, pal } from "@/lib/theme";
import { Badge } from "./Badge";
import { TagPicker } from "./TagPicker";

interface Props { trades: string[]; onAdd: (text: string, trade: string | null) => void; }

export function ItemInput({ trades, onAdd }: Props) {
  const [text, setText] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggIdx, setSuggIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  function commit(tradeOverride?: string | null) {
    const trade = tradeOverride !== undefined ? tradeOverride : selectedTrade;
    const clean = text.replace(/@\w*$/, "").trim();
    if (!clean) return;
    onAdd(clean, trade ?? null);
    setText(""); setSelectedTrade(null); setSuggestions([]);
    ref.current?.focus();
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value; setText(v);
    const m = v.match(/@(\w*)$/);
    if (m) { const q = m[1].toLowerCase(); setSuggestions(trades.filter(t => t.toLowerCase().startsWith(q))); setSuggIdx(0); }
    else setSuggestions([]);
  }
  function applySuggestion(t: string) { setText(text.replace(/@\w*$/, "").trim()); commit(t); }
  function handleKey(e: React.KeyboardEvent) {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSuggIdx(i => (i+1)%suggestions.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSuggIdx(i => (i-1+suggestions.length)%suggestions.length); return; }
      if (e.key === "Enter") { e.preventDefault(); if (suggestions[suggIdx]) applySuggestion(suggestions[suggIdx]); return; }
      if (e.key === "Escape") { setSuggestions([]); return; }
    }
    if (e.key === "Enter") { e.preventDefault(); commit(); }
  }

  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ position:"relative" }}>
        <input ref={ref} value={text} onChange={handleChange} onKeyDown={handleKey} autoFocus
          placeholder="New item — type @trade to tag, then Enter"
          style={{ width:"100%", padding:"10px 14px", paddingRight: selectedTrade ? 140 : 14,
            borderRadius:8, border:`1px solid ${T.border}`, background:T.surface, color:T.text,
            fontSize:14, outline:"none" }}
          onFocus={e => (e.target.style.borderColor = T.borderStrong)}
          onBlur={e => (e.target.style.borderColor = T.border)} />
        {selectedTrade && (
          <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <Badge trade={selectedTrade} trades={trades} />
          </span>
        )}
        {suggestions.length > 0 && (
          <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, background:T.surface,
            border:`1px solid ${T.border}`, borderRadius:8, zIndex:100, minWidth:180,
            boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
            {suggestions.map((t, i) => (
              <div key={t} onMouseDown={e => { e.preventDefault(); applySuggestion(t); }}
                style={{ padding:"8px 12px", cursor:"pointer", fontSize:13,
                  background: i === suggIdx ? T.bg : "transparent", color:T.text,
                  display:"flex", alignItems:"center", gap:8,
                  borderRadius: i === 0 ? "8px 8px 0 0" : i === suggestions.length-1 ? "0 0 8px 8px" : "0" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:pal(t, trades).dot }} />{t}
              </div>
            ))}
          </div>
        )}
      </div>
      <TagPicker trades={trades} selected={selectedTrade}
        onSelect={t => { setSelectedTrade(t); setTimeout(() => { const clean = ref.current?.value.replace(/@\w*$/, "").trim() || ""; setText(clean); commit(t); }, 10); }}
        compact />
    </div>
  );
}