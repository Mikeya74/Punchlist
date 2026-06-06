"use client";
import { useState, useRef, useEffect } from "react";
import { T } from "@/lib/theme";
import { DragList } from "@/components/DragList";
import { DotsMenu } from "@/components/DotsMenu";
import type { Project } from "@/lib/types";

export function HomeView({ projects, rooms, items, trades, setProjectId, setView, addProject, updateProject, deleteProject, reorderProjects, addTrade, deleteTrade }: any) {
  const [filter, setFilter] = useState<"all"|"open"|"closed">("all");
  const [addingProject, setAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project|null>(null);
  const [name, setName] = useState("");
  const [addr, setAddr] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddr, setEditAddr] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [newTrade, setNewTrade] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false); }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = projects.filter((p: Project) => filter === "all" ? true : p.status === filter);

  function getOpenCount(pid: string) {
    const rids = rooms.filter((r: any) => r.project_id === pid).map((r: any) => r.id);
    return items.filter((i: any) => rids.includes(i.room_id) && !i.done).length;
  }

  function startEdit(p: Project) {
    setEditingProject(p);
    setEditName(p.name);
    setEditAddr(p.address || "");
  }

  function saveEdit() {
    if (!editingProject || !editName.trim()) return;
    updateProject(editingProject.id, { name: editName.trim(), address: editAddr.trim() });
    setEditingProject(null);
  }

  const fp = (active: boolean) => ({ padding:"5px 13px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border:`1px solid ${active?T.borderStrong:T.border}`, background:active?T.surface:"transparent", color:active?T.text:T.textMuted } as React.CSSProperties);

  return (
    <div style={{ padding:"1.5rem 1.25rem", maxWidth:640, margin:"0 auto", minHeight:"100vh", background:T.bg }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.5rem", flexWrap:"nowrap", overflowX:"auto" }}>
        <span style={{ fontWeight:700, fontSize:20, color:T.text, flexShrink:0, letterSpacing:"-0.03em" }}>Projects</span>
        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          {(["all","open","closed"] as const).map(f => <button key={f} style={fp(filter===f)} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
        </div>
        <button onClick={() => setAddingProject(true)} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:13, fontWeight:500, cursor:"pointer", flexShrink:0 }}>+ New</button>
        <div style={{ position:"relative", flexShrink:0, marginLeft:"auto" }} ref={settingsRef}>
          <button onClick={() => setShowSettings(v => !v)} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.surface, color:T.textMuted, fontSize:13, cursor:"pointer" }}>⚙ Settings</button>
          {showSettings && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 6px)", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"1.25rem", minWidth:260, zIndex:200, boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Trade tags</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                {trades.map((t: string) => <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:5, background:T.bg, border:`1px solid ${T.border}`, borderRadius:6, padding:"3px 8px", fontSize:12 }}>{t}<span style={{ cursor:"pointer", color:T.textFaint, fontSize:14 }} onClick={() => deleteTrade(t)}>×</span></span>)}
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <input value={newTrade} onChange={e => setNewTrade(e.target.value)} onKeyDown={e => { if (e.key==="Enter") { addTrade(newTrade.trim()); setNewTrade(""); } }} placeholder="Add trade…" style={{ flex:1, padding:"7px 10px", borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, fontSize:13, outline:"none" }} />
                <button onClick={() => { addTrade(newTrade.trim()); setNewTrade(""); }} style={{ padding:"7px 14px", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:13, fontWeight:500, cursor:"pointer" }}>Add</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {addingProject && (
        <div style={{ background:T.surface, border:`1px solid ${T.borderStrong}`, borderRadius:10, padding:"1rem", marginBottom:12 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>New project</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key==="Enter") document.getElementById("paddr")?.focus(); if (e.key==="Escape") { setAddingProject(false); setName(""); setAddr(""); } }} placeholder="Project name" style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, fontSize:14, outline:"none" }} />
            <input id="paddr" value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => { if (e.key==="Enter") { addProject(name.trim(), addr.trim()); setName(""); setAddr(""); setAddingProject(false); } if (e.key==="Escape") { setAddingProject(false); setName(""); setAddr(""); } }} placeholder="Job address (optional)" style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, fontSize:14, outline:"none" }} />
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => { addProject(name.trim(), addr.trim()); setName(""); setAddr(""); setAddingProject(false); }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:13, fontWeight:500, cursor:"pointer" }}>Create</button>
              <button onClick={() => { setAddingProject(false); setName(""); setAddr(""); }} style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.textMuted, fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {editingProject && (
        <div style={{ background:T.surface, border:`1px solid ${T.borderStrong}`, borderRadius:10, padding:"1rem", marginBottom:12 }}>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Edit project</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            <input autoFocus value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => { if (e.key==="Enter") document.getElementById("eaddr")?.focus(); if (e.key==="Escape") setEditingProject(null); }} placeholder="Project name" style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, fontSize:14, outline:"none" }} />
            <input id="eaddr" value={editAddr} onChange={e => setEditAddr(e.target.value)} onKeyDown={e => { if (e.key==="Enter") saveEdit(); if (e.key==="Escape") setEditingProject(null); }} placeholder="Job address (optional)" style={{ padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, fontSize:14, outline:"none" }} />
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={saveEdit} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:13, fontWeight:500, cursor:"pointer" }}>Save</button>
              <button onClick={() => setEditingProject(null)} style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${T.border}`, background:"transparent", color:T.textMuted, fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && <div style={{ textAlign:"center", padding:"3rem 0", color:T.textMuted, fontSize:14 }}>No projects yet.</div>}

      <DragList items={filtered} onReorder={reorderProjects} renderItem={(p: Project) => {
        const open = getOpenCount(p.id);
        return (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:10, border:`1px solid ${T.border}`, background:T.surface, marginBottom:5 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderStrong)} onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            onClick={() => { setProjectId(p.id); setView("project"); }}>
            <span style={{ color:T.textFaint, cursor:"grab", fontSize:14, userSelect:"none" }} onClick={e => e.stopPropagation()}>⠿</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:15 }}>{p.name}</div>
              {p.address && <div style={{ fontSize:12, color:T.textMuted, marginTop:1 }}>{p.address}</div>}
            </div>
            {open > 0 && <span style={{ fontSize:12, color:T.textMuted }}>{open} open</span>}
            <span onClick={e => { e.stopPropagation(); updateProject(p.id, { status: p.status==="open" ? "closed" : "open" }); }} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, cursor:"pointer", border:`1px solid ${T.border}`, color: p.status==="open" ? T.success : T.textFaint }}>{p.status}</span>
            <DotsMenu options={[
              { label:"Edit project", action:() => startEdit(p) },
              { label:"Delete project", danger:true, action:() => deleteProject(p.id) }
            ]} />
          </div>
        );
      }} />
    </div>
  );
}