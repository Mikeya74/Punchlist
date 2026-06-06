"use client";
import { useState, useRef, useEffect } from "react";
import { T } from "@/lib/theme";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) { setDraft(item.text); setDraftTrade(item.trade); setTimeout(() => inputRef.current?.focus(), 50); } }, [editing]);
  function save() { if (draft.trim()) onEdit(item.id, draft.trim(), draftTrade); setEditing(false); }

  if (editing) return (
    <div style={{ padding:"10px 12px", borderRadius:10, marginBottom:4, border:`1px solid ${T.borderStrong}`, background:T.surface }}>
      <input ref={inputRef} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        style={{ width:"100%", padding:"7px 10px", borderRadius:7, border:`1px solid ${T.border}`,
          fontSize:13, background:T.bg, color:T.text, outline:"none", marginBottom:8 }} />
      <TagPicker trades={trades} selected={draftTrade} onSelect={t => setDraftTrade(draftTrade === t ? null : t)} compact />
      <div style={{ display:"flex", gap:6, marginTop:8 }}>
        <button onClick={save} style={{ padding:"5px 14px", borderRadius:7, border:"none", background:T.accent, color:T.accentText, cursor:"pointer", fontSize:12, fontWeight:500 }}>Save</button>
        <button onClick={() => setEditing(false)} style={{ padding:"5px 10px", borderRadius:7, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontSize:12, color:T.textMuted }}>Cancel</button>
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