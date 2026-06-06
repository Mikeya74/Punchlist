"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import type { Item, Room } from "@/lib/types";

interface Props {
  onClose: () => void;
  projectName: string;
  projectAddress?: string;
  items: Item[];
  rooms: Room[];
  filterTag: string | null;
}

export function ShareModal({ onClose, projectName, projectAddress, items, rooms, filterTag }: Props) {
  const [copied, setCopied] = useState(false);
  const openOnly = items.filter(i => !i.done);
  const display = filterTag ? openOnly.filter(i => i.trade === filterTag) : openOnly;
  const grouped: { room: Room; its: Item[] }[] = [];
  rooms.forEach(r => { const its = display.filter(i => i.room_id === r.id); if (its.length) grouped.push({ room: r, its }); });
  const lines = [projectName];
  if (projectAddress) lines.push(projectAddress);
  if (filterTag) lines.push(`Trade: ${filterTag}`);
  lines.push("");
  grouped.forEach(({ room: r, its }) => { lines.push(r.name); its.forEach(i => lines.push(`  [ ] ${i.text}${i.trade ? " — " + i.trade : ""}`)); lines.push(""); });
  const text = lines.join("\n").trim();

  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,25,23,0.4)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", backdropFilter:"blur(2px)" }}
      onClick={onClose}>
      <div style={{ background:T.surface, borderRadius:14, padding:"1.5rem", width:480, maxWidth:"100%",
        border:`1px solid ${T.border}`, maxHeight:"80vh", display:"flex", flexDirection:"column", gap:14 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:600, fontSize:16, color:T.text }}>Share list</div>
            {filterTag && <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>Filtered to: {filterTag}</div>}
          </div>
          <button onClick={onClose} style={{ border:"none", background:"none", cursor:"pointer", fontSize:20, color:T.textFaint }}>×</button>
        </div>
        <div style={{ background:T.bg, borderRadius:10, padding:"1rem", overflowY:"auto", flex:1, border:`1px solid ${T.border}` }}>
          <pre style={{ margin:0, fontSize:12, whiteSpace:"pre-wrap", color:T.text, fontFamily:"ui-monospace,monospace", lineHeight:1.7 }}>{text || "No open items to share."}</pre>
        </div>
        <button onClick={copy} style={{ width:"100%", padding:"10px 0", borderRadius:8,
          border:`1px solid ${copied ? T.success : T.border}`,
          background: copied ? "#F0FDF4" : T.accent, color: copied ? T.success : T.accentText,
          cursor:"pointer", fontSize:14, fontWeight:600 }}>
          {copied ? "✓  Copied to clipboard" : "Copy list"}
        </button>
      </div>
    </div>
  );
}