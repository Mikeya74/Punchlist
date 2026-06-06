"use client";
import { pal } from "@/lib/theme";

export function Badge({ trade, trades }: { trade: string; trades: string[] }) {
  const p = pal(trade, trades);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:p.bg, color:p.text, borderRadius:6, fontSize:11, padding:"2px 8px", fontWeight:500, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:p.dot, display:"inline-block", flexShrink:0 }} />
      {trade}
    </span>
  );
}