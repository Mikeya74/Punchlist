"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import { ItemInput } from "@/components/ItemInput";
import { EditableItem } from "@/components/EditableItem";
import { DotsMenu } from "@/components/DotsMenu";
import type { Room, Item } from "@/lib/types";

function SectionLabel({ children, menu }: { children: React.ReactNode; menu?: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0 6px" }}>
      <div style={{ fontSize:11, fontWeight:600, color:T.textFaint, letterSpacing:"0.08em", textTransform:"uppercase" }}>{children}</div>
      {menu}
    </div>
  );
}

export function RoomView({ rooms, items, trades, roomId, projectId, setView, addItem, toggleItem, editItem, deleteItem, deleteDoneItems }: any) {
  const room: Room = rooms.find((r: Room) => r.id === roomId);
  useSwipeBack(() => setView("project"));
  const [sortByTag, setSortByTag] = useState(false);

  const roomItems: Item[] = items.filter((i: Item) => i.room_id === roomId);
  const displayItems = sortByTag ? [...roomItems].sort((a,b) => (a.trade||"").localeCompare(b.trade||"")) : roomItems;
  const openItems = displayItems.filter(i => !i.done);
  const doneItems = displayItems.filter(i => i.done);

  return (
    <div style={{ padding:"1.5rem 1.25rem", maxWidth:640, margin:"0 auto", minHeight:"100vh", background:T.bg }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.25rem", flexWrap:"nowrap" }}>
        <button onClick={() => setView("project")} style={{ padding:"6px 8px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.textMuted, fontSize:13, cursor:"pointer", flexShrink:0 }}>← Back</button>
        <span style={{ fontWeight:700, fontSize:20, flex:1, letterSpacing:"-0.03em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{room?.name}</span>
        <button onClick={() => setSortByTag(v => !v)} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${sortByTag?T.borderStrong:T.border}`, background:sortByTag?T.surface:"transparent", color:sortByTag?T.text:T.textMuted, fontSize:12, fontWeight:500, cursor:"pointer", flexShrink:0 }}>A–Z</button>
      </div>

      <ItemInput trades={trades} onAdd={(text, trade) => addItem(roomId, text, trade)} />

      <div style={{ marginTop:"0.5rem" }}>
        {openItems.map(i => <EditableItem key={i.id} item={i} trades={trades} onToggle={toggleItem} onDelete={deleteItem} onEdit={editItem} />)}
        {doneItems.length > 0 && (
          <SectionLabel menu={<DotsMenu options={[{ label:"Delete all completed", danger:true, action:() => deleteDoneItems(roomId) }]} />}>
            Completed
          </SectionLabel>
        )}
        {doneItems.map(i => <EditableItem key={i.id} item={i} trades={trades} onToggle={toggleItem} onDelete={deleteItem} onEdit={editItem} />)}
        {openItems.length === 0 && doneItems.length === 0 && <div style={{ color:T.textMuted, fontSize:14, padding:"2rem 0", textAlign:"center" }}>No items yet — start typing above.</div>}
      </div>
    </div>
  );
}