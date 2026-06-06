"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/theme";
import type { Project, Room, Item } from "@/lib/types";
import { HomeView } from "@/views/HomeView";
import { ProjectView } from "@/views/ProjectView";
import { RoomView } from "@/views/RoomView";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [trades, setTrades] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [view, setView] = useState<"home"|"project"|"room">("home");
  const [projectId, setProjectId] = useState<string|null>(null);
  const [roomId, setRoomId] = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: r }, { data: i }, { data: t }] = await Promise.all([
        supabase.from("projects").select("*").order("sort_order"),
        supabase.from("rooms").select("*").order("sort_order"),
        supabase.from("items").select("*").order("created_at"),
        supabase.from("trades").select("*").order("name"),
      ]);
      if (p) setProjects(p); if (r) setRooms(r); if (i) setItems(i);
      if (t) setTrades(t.map((x: any) => x.name));
      setLoaded(true);
    }
    load();

    const ch = supabase.channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  async function addProject(name: string, address: string) {
    const sort_order = projects.length;
    await supabase.from("projects").insert({ name, address, status:"open", sort_order });
  }
  async function updateProject(id: string, updates: Partial<Project>) {
    await supabase.from("projects").update(updates).eq("id", id);
  }
  async function deleteProject(id: string) {
    await supabase.from("projects").delete().eq("id", id);
  }
  async function addRoom(projectId: string, name: string) {
    const sort_order = rooms.filter(r => r.project_id === projectId).length;
    await supabase.from("rooms").insert({ project_id: projectId, name, sort_order });
  }
  async function renameRoom(id: string, name: string) {
    await supabase.from("rooms").update({ name }).eq("id", id);
  }
  async function deleteRoom(id: string) {
    await supabase.from("rooms").delete().eq("id", id);
  }
  async function addItem(roomId: string, text: string, trade: string | null) {
    await supabase.from("items").insert({ room_id: roomId, text, trade, done: false });
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
    await supabase.from("trades").insert({ name });
  }
  async function deleteTrade(name: string) {
    await supabase.from("trades").delete().eq("name", name);
  }

  if (!loaded) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:T.textMuted, fontSize:14 }}>Loading…</div>;

  const shared = {
    projects, rooms, items, trades, projectId, roomId,
    setProjectId, setRoomId, setView,
    addProject, updateProject, deleteProject,
    addRoom, renameRoom, deleteRoom,
    addItem, toggleItem, editItem, deleteItem, deleteDoneItems,
    reorderProjects, reorderRooms,
    addTrade, deleteTrade,
  };

  if (view === "home") return <HomeView {...shared} />;
  if (view === "project") return <ProjectView {...shared} />;
  if (view === "room") return <RoomView {...shared} />;
}