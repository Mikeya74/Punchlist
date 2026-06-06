"use client";
import { useState } from "react";
import { T } from "@/lib/theme";
import { DragList } from "@/components/DragList";
import { DotsMenu } from "@/components/DotsMenu";
import { ShareModal } from "@/components/ShareModal";
import { Badge } from "@/components/Badge";
import type { Project, Room, Item } from "@/lib/types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:11, fontWeight:600, color:T.textFaint, letterSpacing:"0.08em", textTransform:"uppercase", margin:"16px 0 6px" }}>{children}</div>;
}

export function ProjectView({ projects, rooms, items, trades, projectId, setRoomId, setView, updateProject, deleteRoom, addRoom, toggleItem, editItem, deleteItem, reorderRooms }: any) {
  const project: Project = projects.find((p: Project) => p.id === projectId);
  const projectRooms: Room[] = rooms.filter((r: Room) => r.project_id === projectId);
  const [tradeFilter, setTradeFilter] = useState<string|null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Record<string,boolean>>({});
  const [addingRoom, setAddingRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [showShare, setShowShare] = useState(false);

  function getProjectItems() { const rids = projectRooms.map(r => r.id); return items.filter((i: Item) => rids.includes(i.room_id)); }
  const allItems = getProjectItems();
  const projectTrades = [...new Set(allItems.map((i: Item) => i.trade).filter(Boolean))] as string[];
  const filteredItems = tradeFilter ? allItems.filter((i: Item) => i.trade === tradeFilter) : allItems;
  const anyExpanded = projectRooms.some((r: Room) => expandedRooms[r.id]);

  function toggleAll() {
    if (anyExpanded) setExpandedRooms({});
    else { const next: Record<string,boolean> = {}; projectRooms.forEach((r: Room) => { next[r.id] = true; }); setExpandedRooms(next); }
  }

  const tradePill = (active: boolean) => ({ padding:"4px 11px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", border:`1px solid ${active?T.borderStrong:T.border}`, background:active?T.surface:"transparent", color:active?T.text:T.textMuted, whiteSpace:"nowrap" } as React.CSSProperties);

  return (
    <div style={{ padding:"1.5rem 1.25rem", maxWidth:640, margin:"0 auto", minHeight:"100vh", background:T.bg }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:"1.25rem", flexWrap:"wrap" }}>
        <button onClick={() => setView("home")} style={{ padding:"6px 8px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.textMuted, fontSize:13, cursor:"pointer" }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:20, letterSpacing:"-0.03em" }}>{project?.name}</div>
          {project?.address && <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{project.address}</div>}
        </div>
        <span onClick={() => updateProject(projectId, { status: project?.status==="open"?"closed":"open" })} style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer", border:`1px solid ${T.border}`, color: project?.status==="open" ? T.success : T.textFaint }}>{project?.status}</span>
        <button onClick={() => setShowShare(true)} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:13, fontWeight:500, cursor:"pointer" }}>Share</button>
      </div>

      {projectTrades.length > 0 && (
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:"1rem" }}>
          <button style={tradePill(!tradeFilter)} onClick={() => setTradeFilter(null)}>All</button>
          {projectTrades.map(t => <button key={t} style={tradePill(tradeFilter===t)} onClick={() => setTradeFilter(tradeFilter===t?null:t)}>{t}</button>)}
        </div>
      )}

      {tradeFilter ? (
        <div>
          {projectRooms.map((r: Room) => {
            const its = filteredItems.filter((i: Item) => i.room_id === r.id);
            if (!its.length) return null;
            return (
              <div key={r.id} style={{ marginBottom:"1.25rem" }}>
                <SectionLabel>{r.name}</SectionLabel>
                {its.map((i: Item) => (
                  <div key={i.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, marginBottom:3, border:`1px solid ${T.border}`, background: i.done?T.bg:T.surface }}>
                    <div onClick={() => toggleItem(i.id)} style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${i.done?T.success:T.borderStrong}`, background:i.done?T.success:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                      {i.done && <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>}
                    </div>
                    <span style={{ flex:1, fontSize:14, textDecoration:i.done?"line-through":"none", color:i.done?T.textFaint:T.text }}>{i.text}</span>
                    {i.trade && <Badge trade={i.trade} trades={trades} />}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <button onClick={() => setAddingRoom(true)} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${T.border}`, background:T.surface, color:T.textMuted, fontSize:13, cursor:"pointer" }}>+ Add room</button>
            {projectRooms.length > 0 && <button onClick={toggleAll} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${T.border}`, background:T.surface, color:T.textMuted, fontSize:13, cursor:"pointer" }}>{anyExpanded?"Collapse all":"Expand all"}</button>}
          </div>
          {addingRoom && (
            <div style={{ background:T.surface, border:`1px solid ${T.borderStrong}`, borderRadius:10, padding:"1rem", marginBottom:10 }}>
              <div style={{ display:"flex", gap:6 }}>
                <input autoFocus value={roomName} onChange={e => setRoomName(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") { addRoom(projectId, roomName.trim()); setRoomName(""); setAddingRoom(false); } if (e.key==="Escape") { setAddingRoom(false); setRoomName(""); } }}
                  placeholder="Room name" style={{ flex:1, padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, fontSize:14, outline:"none" }} />
                <button onClick={() => { addRoom(projectId, roomName.trim()); setRoomName(""); setAddingRoom(false); }} style={{ padding:"7px 14px", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:13, fontWeight:500, cursor:"pointer", flexShrink:0 }}>Add</button>
                <button onClick={() => { setAddingRoom(false); setRoomName(""); }} style={{ padding:"7px 10px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.textMuted, fontSize:13, cursor:"pointer", flexShrink:0 }}>Cancel</button>
              </div>
            </div>
          )}
          <DragList items={projectRooms} onReorder={reorderRooms} renderItem={(r: Room) => {
            const rItems = items.filter((i: Item) => i.room_id === r.id);
            const open = rItems.filter((i: Item) => !i.done);
            const exp = expandedRooms[r.id];
            return (
              <div style={{ marginBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:exp?"10px 10px 0 0":10, border:`1px solid ${T.border}`, background:T.surface }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor=T.borderStrong)} onMouseLeave={e => (e.currentTarget.style.borderColor=T.border)}>
                  <span style={{ color:T.textFaint, cursor:"grab", fontSize:14, userSelect:"none" }}>⠿</span>
                  <span style={{ flex:1, fontWeight:600, fontSize:15, cursor:"pointer" }} onClick={() => { setRoomId(r.id); setView("room"); }}>{r.name}</span>
                  <span style={{ fontSize:12, color:T.textMuted }}>{open.length} open</span>
                  <button onClick={e => { e.stopPropagation(); setExpandedRooms(prev => ({ ...prev, [r.id]: !prev[r.id] })); }} style={{ border:"none", background:"none", cursor:"pointer", color:T.textMuted, fontSize:22, padding:"0 4px", transform:exp?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s", lineHeight:1 }}>▾</button>
                  <DotsMenu options={[{ label:"Delete room", danger:true, action:() => deleteRoom(r.id) }]} />
                </div>
                {exp && (
                  <div style={{ border:`1px solid ${T.border}`, borderTop:"none", borderRadius:"0 0 10px 10px", padding:"8px 12px", background:T.bg }}>
                    {open.length === 0
                      ? <div style={{ fontSize:13, color:T.textFaint, padding:"6px 0" }}>No open items</div>
                      : open.map((i: Item) => (
                        <div key={i.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, marginBottom:3, border:`1px solid ${T.border}`, background:T.surface }}>
                          <div onClick={() => toggleItem(i.id)} style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${T.borderStrong}`, background:"transparent", cursor:"pointer", flexShrink:0 }} />
                          <span style={{ flex:1, fontSize:13 }}>{i.text}</span>
                          {i.trade && <Badge trade={i.trade} trades={trades} />}
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          }} />
          {projectRooms.length === 0 && <div style={{ color:T.textMuted, fontSize:14, padding:"2rem 0", textAlign:"center" }}>No rooms yet.</div>}
        </>
      )}
      {showShare && <ShareModal onClose={() => setShowShare(false)} projectName={project?.name} projectAddress={project?.address} items={allItems} rooms={projectRooms} filterTag={tradeFilter} />}
    </div>
  );
}