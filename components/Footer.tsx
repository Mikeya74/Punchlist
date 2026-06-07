"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { T } from "@/lib/theme";

export function Footer({ teamCode }: { teamCode: string }) {
  const [logoUrl, setLogoUrl] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const { data } = supabase.storage.from("logos").getPublicUrl(`${teamCode}/logo.png`);
    fetch(data.publicUrl, { method: "HEAD" })
      .then(res => { if (res.ok) setLogoUrl(data.publicUrl + "?t=" + Date.now()); })
      .catch(() => {});
  }, [teamCode]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { error } = await supabase.storage.from("logos").upload(`${teamCode}/logo.png`, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("logos").getPublicUrl(`${teamCode}/logo.png`);
      setLogoUrl(data.publicUrl + "?t=" + Date.now());
    }
    setUploading(false);
  }

  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.border}`, padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:100 }}>
      {logoUrl ? (
        <img src={logoUrl} alt="Logo" style={{ height:32, objectFit:"contain", maxWidth:160 }} />
      ) : (
        <span style={{ fontSize:12, color:T.textFaint }}>No logo uploaded</span>
      )}
      <label style={{ padding:"5px 12px", borderRadius:7, border:`1px solid ${T.border}`, background:T.bg, color:T.textMuted, fontSize:12, cursor:"pointer", flexShrink:0 }}>
        {uploading ? "Uploading…" : "Upload logo"}
        <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleUpload} style={{ display:"none" }} />
      </label>
    </div>
  );
}