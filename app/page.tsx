"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/theme";
import type { Project, Room, Item } from "@/lib/types";
import { HomeView } from "@/views/HomeView";
import { ProjectView } from "@/views/ProjectView";
import { RoomView } from "@/views/RoomView";
import { Footer } from "@/components/Footer";

function TeamCodeScreen({ onEnter }: { onEnter: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:T.bg, padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:360 }}>
        <div style={{ fontWeight:700, fontSize:24, color:T.text, marginBottom:8, letterSpacing:"-0.03em" }}>Punch List</div>
        <div style={{ fontSize:14, color:T.textMuted, marginBottom:24 }}>Enter your team code to get started. Share this code with your team so everyone sees the same projects.</div>
        <input
          autoFocus
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key==="Enter" && code.trim()) onEnter(code.trim()); }}
          placeholder="e.g. ACME2024"
          style={{ width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:8, border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontSize:16, outline:"none", marginBottom:12, letterSpacing:"0.05em" }}
          onFocus={e => (e.target.style.borderColor = T.borderStrong)}
          onBlur={e => (e.target.style.borderColor = T.border)}
        />
        <button
          onClick={() => { if (code.trim()) onEnter(code.trim()); }}
          style={{ width:"100%", padding:"12px 0", borderRadius:8, border:"none", background:T.accent, color:T.accentText, fontSize:15, fontWeight:600, cursor:"pointer" }}>
          Enter
        </button>
        <div style={{ fontSize:12, color:T.textFaint, marginTop:16, textAlign:"center" }}>
          Your team code is case-insensitive. Everyone with the same code shares the same data.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [teamCode, setTeamCode] = useState<string|null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [trades, setTrades] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState<"home"|"project"|"room">("home");
  const [projectId, setProjectId] = useState<string|null>(null);
  const [roomId, setRoomId] = useState<string|null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("pl_team_code");
    if (saved) setTeamCode(saved);
    else setLoaded(true);
  }, []);

  useEffect(() => {
    if (!teamCode) return;
    localStorage.setItem("pl_team_code", teamCode);

    async function load() {
      const [{ data: p }, { data: r }, { data: i }, { data: t }] = await Promise.all([
        supabase.from("projects").select("*").eq("team_code", teamCode).order("sort_order"),
        supabase.from("rooms").select("*").eq("team_code", teamCode).order("sort_order"),
        supabase.from("items").select("*").eq("team_code", teamCode).order("created_at"),
        supabase.from("trades").select("*").eq("team_code", teamCode).order("name"),
      ]);
      if (p) setProjects(p); if (r) setRooms(r); if (i) setItems(i);
      if (t) setTrades(t.map((x: any) => x.name));
      setLoaded(true);
    }
    load();

    const ch = supabase.channel(`realtime-${teamCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [teamCode]);

  async function handleEnterCode(code: string) {
    const upper = code.toUpperCase();
    window.localStorage.setItem("pl_team_code", upper);

    // Check if this team code has any trades yet
    const { data: existing } = await supabase
      .from("trades")
      .select("id")
      .eq("team_code", upper)
      .limit(1);

    // If no trades exist, insert defaults
    if (!existing || existing.length === 0) {
      await supabase.rpc("insert_default_trades", { p_team_code: upper });
    }

    setTeamCode(upper);
  }

  async function addProject(name: string, address: string) {
    const sort_order = projects.length;
    await supabase.from("projects").insert({ name, address, status:"open", sort_order, team_code: teamCode });
  }
  async function updateProject(id: string, updates: Partial<Project>) {
    await supabase.from("projects").update(updates).eq("id", id);
  }
  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id);
  }
  async function addRoom(projectId: string, name: string) {
    const sort_order = rooms.filter(r => r.project_id === projectId).length;
    await supabase.from("rooms").insert({ project_id: projectId, name, sort_order, team_code: teamCode });
  }
  async function renameRoom(id: string, name: string) {
    await supabase.from("rooms").update({ name }).eq("id", id);
  }
  async function deleteRoom(id: string) {
    await supabase.from("rooms").delete().eq("id", id);
  }
  async function addItem(roomId: string, text: string, trade: string | null) {
    await supabase.from("items").insert({ room_id: roomId, text, trade, done: false, team_code: teamCode });
  }
  async function toggleItem(id: string) {
    const item = items.find(i => i.id === id);
    if (item) await supabase.from("items").update({ done: !item.done }).eq("id", id);
  }
  async function editItem(id: string, text: string, trade: string | null) {
    await supabase.from("items").update({ text, trade }).eq("id", id);
  }
  async function deleteItem(id: string) {
    await supabase.from("items").delete().eq("id", id);
  }
  async function deleteDoneItems(roomId: string) {
    await supabase.from("items").delete().eq("room_id", roomId).eq("done", true);
  }
  async function reorderProjects(ordered: Project[]) {
    setProjects(ordered);
    await Promise.all(ordered.map((p, i) => supabase.from("projects").update({ sort_order: i }).eq("id", p.id)));
  }
  async function reorderRooms(ordered: Room[]) {
    setRooms(prev => { const ids = ordered.map(r => r.id); return [...ordered, ...prev.filter(r => !ids.includes(r.id))]; });
    await Promise.all(ordered.map((r, i) => supabase.from("rooms").update({ sort_order: i }).eq("id", r.id)));
  }
  async function addTrade(name: string) {
    await supabase.from("trades").insert({ name, team_code: teamCode });
  }
  async function deleteTrade(name: string) {
    await supabase.from("trades").delete().eq("name", name).eq("team_code", teamCode);
  }

  if (!teamCode) return <TeamCodeScreen onEnter={handleEnterCode} />;
  if (!loaded) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:T.textMuted, fontSize:14 }}>Loading…</div>;

  const shared = {
    projects, rooms, items, trades, projectId, roomId,
    setProjectId, setRoomId, setView,
    teamCode,
    addProject, updateProject, deleteProject,
    addRoom, renameRoom, deleteRoom,
    addItem, toggleItem, editItem, deleteItem, deleteDoneItems,
    reorderProjects, reorderRooms,
    addTrade, deleteTrade,
  };

 return (
    <div style={{ paddingBottom:60 }}>
      {view === "home" && <HomeView {...shared} />}
      {view === "project" && <ProjectView {...shared} />}
      {view === "room" && <RoomView {...shared} />}
      <Footer teamCode={teamCode} />
    </div>
  );
}