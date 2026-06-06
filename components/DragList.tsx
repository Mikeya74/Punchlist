"use client";
import { useState } from "react";
import { T } from "@/lib/theme";

interface Props<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

export function DragList<T extends { id: string }>({ items, onReorder, renderItem }: Props<T>) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  function onDragStart(e: React.DragEvent, id: string) { setDragging(id); e.dataTransfer.effectAllowed = "move"; }
  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setOver(id); }
  function onDrop(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragging === id) { setDragging(null); setOver(null); return; }
    const from = items.findIndex(i => i.id === dragging);
    const to = items.findIndex(i => i.id === id);
    const next = [...items]; const [m] = next.splice(from, 1); next.splice(to, 0, m);
    onReorder(next); setDragging(null); setOver(null);
  }

  return (
    <div>
      {items.map(item => (
        <div key={item.id} draggable
          onDragStart={e => onDragStart(e, item.id)} onDragOver={e => onDragOver(e, item.id)}
          onDrop={e => onDrop(e, item.id)} onDragEnd={() => { setDragging(null); setOver(null); }}
          style={{ opacity: dragging === item.id ? 0.4 : 1, borderRadius:10,
            outline: over === item.id && dragging !== item.id ? `2px solid ${T.borderStrong}` : "2px solid transparent",
            transition: "outline 0.1s" }}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}