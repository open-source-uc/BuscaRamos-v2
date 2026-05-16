"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Barlow_Condensed } from "next/font/google";
import { toast } from "sonner";
import { getBoldSlides } from "./_bold";
import { getTicketSlides } from "./_ticket";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const TOTAL = 8;
type Style = "bold" | "ticket";

function Toggle({ style, onChange }: { style: Style; onChange: (s: Style) => void }) {
  return (
    <div
      className="flex rounded-full p-1 gap-1"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      {(["bold", "ticket"] as Style[]).map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all"
          style={
            style === s
              ? { background: "white", color: "black" }
              : { color: "rgba(255,255,255,0.4)" }
          }
        >
          {s === "bold" ? "Póster" : "Recibo"}
        </button>
      ))}
    </div>
  );
}

function ArrowBtn({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full text-xl font-black transition-all"
      style={{
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.7)",
        opacity: disabled ? 0 : 1,
      }}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

export default function WrappedPage() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");
  const [style, setStyle] = useState<Style>("bold");
  const touchX = useRef<number | null>(null);

  const next = useCallback(() => {
    setDir("fwd");
    setIdx((i) => Math.min(i + 1, TOTAL - 1));
  }, []);

  const prev = useCallback(() => {
    setDir("bwd");
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  const share = useCallback(() => {
    navigator.clipboard
      .writeText("https://buscaramos.osuc.dev/wrapped")
      .then(() => toast.success("Link copiado"))
      .catch(() => toast.error("No se pudo copiar"));
  }, []);

  const handleStyleChange = useCallback((s: Style) => {
    setStyle(s);
    setIdx(0);
    setDir("fwd");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const slides = style === "bold" ? getBoldSlides(share) : getTicketSlides(share);

  const progressBg = (i: number) =>
    i <= idx
      ? style === "ticket"
        ? "rgba(0,0,0,0.5)"
        : "rgba(255,255,255,0.85)"
      : style === "ticket"
        ? "rgba(0,0,0,0.15)"
        : "rgba(255,255,255,0.2)";

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (delta < -40) next();
    else if (delta > 40) prev();
    touchX.current = null;
  };

  // Contenido interior del card: slide + barra de progreso + zonas de tap
  // Se renderiza dos veces (mobile y desktop) pero CSS oculta uno siempre
  const cardContent = (
    <>
      <div
        key={`${style}-${idx}`}
        className={`w-full h-full animate-in duration-200 ${
          dir === "fwd" ? "slide-in-from-right-8" : "slide-in-from-left-8"
        }`}
      >
        {slides[idx]}
      </div>

      {/* Barra de progreso */}
      <div className="absolute top-3 left-4 right-4 flex gap-1 z-30 pointer-events-none">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="h-0.75 flex-1 rounded-full transition-colors duration-300"
            style={{ background: progressBg(i) }}
          />
        ))}
      </div>

      {/* Zonas de navegación por tap */}
      <div className="absolute inset-0 z-10 flex">
        <div className="flex-1 cursor-pointer" onClick={prev} />
        <div className="flex-1 cursor-pointer" onClick={next} />
      </div>
    </>
  );

  return (
    <div
      className={`${barlow.variable} fixed inset-0 z-50 bg-zinc-950`}
      style={{ fontFamily: "var(--font-barlow)" }}
    >
      {/* ── MOBILE: visible en < 768px ───────────────────────── */}
      <div className="flex flex-col h-full md:hidden">
        <div
          className="relative flex-1 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {cardContent}
        </div>

        {/* Toggle flotante */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40">
          <Toggle style={style} onChange={handleStyleChange} />
        </div>
      </div>

      {/* ── DESKTOP: visible en >= 768px ─────────────────────── */}
      <div className="hidden md:flex flex-col h-full items-center justify-center gap-5">
        <div className="flex items-center gap-4">
          <ArrowBtn dir="prev" onClick={prev} disabled={idx === 0} />

          <div
            className="relative w-97.5 h-195 max-h-[calc(100dvh-120px)] rounded-[28px] overflow-hidden shadow-2xl"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {cardContent}
          </div>

          <ArrowBtn dir="next" onClick={next} disabled={idx === TOTAL - 1} />
        </div>

        <Toggle style={style} onChange={handleStyleChange} />
      </div>
    </div>
  );
}
