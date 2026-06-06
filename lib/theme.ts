export const T = {
  bg: "#F7F5F2",
  surface: "#FDFCFB",
  surfaceHover: "#F2F0ED",
  border: "#E4E0DA",
  borderStrong: "#C9C4BC",
  text: "#1C1917",
  textMuted: "#78716C",
  textFaint: "#A8A29E",
  accent: "#1C1917",
  accentText: "#FDFCFB",
  success: "#16A34A",
};

export const PALETTES = [
  { bg: "#EEF2FF", text: "#3730A3", dot: "#6366F1" },
  { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
  { bg: "#FFF7ED", text: "#9A3412", dot: "#F97316" },
  { bg: "#FDF2F8", text: "#86198F", dot: "#D946EF" },
  { bg: "#F0F9FF", text: "#075985", dot: "#0EA5E9" },
  { bg: "#FEFCE8", text: "#854D0E", dot: "#EAB308" },
  { bg: "#FFF1F2", text: "#9F1239", dot: "#F43F5E" },
  { bg: "#F0FDFA", text: "#134E4A", dot: "#14B8A6" },
  { bg: "#FAF5FF", text: "#6B21A8", dot: "#A855F7" },
  { bg: "#FFF8F1", text: "#7C2D12", dot: "#EA580C" },
];

export function pal(trade: string, trades: string[]) {
  return PALETTES[Math.max(0, trades.indexOf(trade)) % PALETTES.length];
}