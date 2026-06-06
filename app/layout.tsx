import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punch List",
  description: "Construction punch list app",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Punch List" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}