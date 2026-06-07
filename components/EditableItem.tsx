"use client";
import { useState, useRef, useEffect } from "react";
import { T, pal } from "@/lib/theme";
import { Badge } from "./Badge";
import { TagPicker } from "./TagPicker";
import type { Item } from "@/lib/types";

interface Props {
  item: Item; trades: string[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, trade: string | null) => void;
}

export function EditableItem({ item, trades, onToggle, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const [draftTrade, setDraftTrade] = useState(item.trade);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggIdx, setSuggIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(item.text);
      setDraftTrade(item.trade);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [editing]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setDraft(v);
    const m = v.match(/@(\w*)$/);
    if (m) {
      const q = m[1].toLowerCase();
      setSuggestions(trades.filter(t => t.toLowerCase().startsWith(q)));
      setSuggIdx(0);
    } else {
      setSuggestions([]);
    }
  }

  function applySuggestion(t: string) {
    const base = draft.replace(/@\w*$/, "").trim();
    setDraft(base);
    setDraftTrade(t);
    setSuggestions([]);
  }

  function save(tradeOverride?: string | null) {
    const trade = tradeOverride !== undefined ? tradeOverride : draftTrade;
    const clean = draft.replace(/@\w*$/, "").trim();
    if (clean.trim()) onEdit(item.id, clean.trim(), trade ?? null);
    setEditing(false);
    setSuggestions([]);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSuggIdx(i => (i+1)%suggestions.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSuggIdx(i => (i-1+suggestions.length)%suggestions.length); return; }
      if (e.key === "Enter") { e.preventDefault(); if (suggestions[suggIdx]) applySuggestion(suggestions[suggIdx]); return; }
      if (e.key === "Escape") { setSuggestions([]); return; }
    }
    if (e.key === "Enter") { e.preventDefault(); save(); }
    if (e.key === "Escape") { setEditing(false); setSuggestions([]); }
  }

  if (editing) return (
    <div style={{ padding:"10px 12px", borderRadius:10, marginBottom:4, border:`1px solid ${T.borderStrong}`, background:T.surface }}>
      <div style={{ position:"relative" }}>
        <input ref={inputRef} value={draft} onChange={handleChange} onKeyDown={handleKey}
          style={{ width:"100%", boxSizing:"border-box", padding:"7px 10px", borderRadius:7, border:`1px solid ${T.border}`,
            fontSize:13, background:T.bg, color:T.text, outline:"none", marginBottom:8 }} />
        {suggestions.length > 0 && (
          <div style={{ position:"absolute", top:"100%", left:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, zIndex:100, minWidth:180, boxShadow:"0 4px 16px rgba(0,0,0,0.08)", marginTop:2 }}>
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
      <TagPicker trades={trades} selected={draftTrade} onSelect={t => setDraftTrade(draftTrade === t ? null : t)} compact />
      <div style={{ display:"flex", gap:6, marginTop:8 }}>
        <button onClick={() => save()} style={{ padding:"5px 14px", borderRadius:7, border:"none", background:T.accent, color:T.accentText, cursor:"pointer", fontSize:12, fontWeight:500 }}>Save</button>
        <button onClick={() => { setEditing(false); setSuggestions([]); }} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontSize:12, color:T.textMuted }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, marginBottom:3,
      border:`1px solid ${T.border}`, background: item.done ? T.bg : T.surface }}
      onMouseEnter={e => { if (!item.done) (e.currentTarget as HTMLDivElement).style.background = T.surfaceHover; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = item.done ? T.bg : T.surface; }}>
      <div onClick={() => onToggle(item.id)}
        style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${item.done ? T.success : T.borderStrong}`,
          background: item.done ? T.success : "transparent", display:"flex", alignItems:"center",
          justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
        {item.done && <span style={{ color:"#fff", fontSize:11, fontWeight:700, lineHeight:1 }}>✓</span>}
      </div>
      <span onClick={() => !item.done && setEditing(true)}
        style={{ flex:1, fontSize:14, textDecoration: item.done ? "line-through" : "none",
          color: item.done ? T.textFaint : T.text, cursor: item.done ? "default" : "pointer" }}>
        {item.text}
      </span>
      {item.trade && <Badge trade={item.trade} trades={trades} />}
    </div>
  );
}