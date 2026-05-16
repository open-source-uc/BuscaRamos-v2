import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wrapped 2026-1 | BuscaRamos",
  description: "Tu semestre universitario en 8 slides",
};

export default function WrappedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
