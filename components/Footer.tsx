"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/theme";

export function Footer({ teamCode }: { teamCode: string }) {
  const [logoUrl, setLogoUrl] = useState<string|null>(null);

  useEffect(() => {
    const { data } = supabase.storage.from("logos").getPublicUrl(`${teamCode}/logo.png`);
    fetch(data.publicUrl, { method: "HEAD" })
      .then(res => { if (res.ok) setLogoUrl(data.publicUrl + "?t=" + Date.now()); })
      .catch(() => {});
  }, [teamCode]);

  if (!logoUrl) return null;

  return (
    <div style={{ position:"fixed", bottom:10, left:0, right:0, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, pointerEvents:"none" }}>
      <img src={logoUrl} alt="Logo" style={{ height:32, objectFit:"contain", maxWidth:160, opacity:0.85 }} />
    </div>
  );
}