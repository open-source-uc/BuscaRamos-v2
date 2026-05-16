import type { ReactNode } from "react";

const BG = "#FAFAF8";
const FOOTER_BG = "#111111";
const GOLD = "#F5C518";
const RAINBOW = "linear-gradient(to right, #FFE000, #FF6600, #FF00CC, #7700FF, #0099FF)";

function RainbowBar() {
  return <div style={{ height: 8, background: RAINBOW, flexShrink: 0 }} />;
}

function Dash() {
  return <div className="border-t-2 border-dashed border-black/15 my-3" />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end gap-1 py-[3px]">
      <span className="text-[11px] font-bold uppercase tracking-wide text-black/55 whitespace-nowrap">
        {label}
      </span>
      <span
        className="flex-1 mx-1"
        style={{ borderBottom: "2px dotted rgba(0,0,0,0.18)", marginBottom: 3 }}
      />
      <span className="text-[11px] font-black uppercase text-black whitespace-nowrap">{value}</span>
    </div>
  );
}

function Sig({ text = "♦♦♦ gracias · vuelve pronto ♦♦♦" }: { text?: string }) {
  return (
    <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-black/35 py-2">
      {text}
    </p>
  );
}

function Punch() {
  return (
    <div className="flex justify-between px-3 py-2" style={{ background: BG }}>
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} className="w-[9px] h-[9px] rounded-full" style={{ background: FOOTER_BG }} />
      ))}
    </div>
  );
}

function TicketFooter() {
  return (
    <div
      className="flex justify-between items-center px-6 py-3 shrink-0"
      style={{ background: FOOTER_BG }}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: GOLD }}>
        BUSCARAMOS
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: GOLD }}>
        WRAP · 26-1
      </span>
    </div>
  );
}

function TicketShell({ slip, children, sig }: { slip: string; children: ReactNode; sig?: string }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: BG }}>
      <RainbowBar />

      {/* Cabecera */}
      <div
        className="px-6 pt-4 pb-3 shrink-0"
        style={{ borderBottom: "2px dashed rgba(0,0,0,0.15)" }}
      >
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
          BUSCARAMOS WRAP
        </p>
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-black mt-0.5">
          {slip}
        </p>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">{children}</div>

      {/* Pie */}
      <div className="px-6 shrink-0">
        <Dash />
        <Sig text={sig} />
      </div>
      <Punch />
      <TicketFooter />
    </div>
  );
}

/* ── Slides ───────────────────────────────────────────────── */

function T0_Cover() {
  return (
    <TicketShell slip="SLIP · SEMESTRE 2026-1" sig="♦♦♦ empieza el show ♦♦♦">
      <div className="flex-1 flex flex-col justify-center">
        <h1
          className="font-black text-black leading-[0.9]"
          style={{ fontSize: "clamp(42px, 13vw, 60px)", fontFamily: "var(--font-barlow)" }}
        >
          Tu
          <br />
          semestre,
          <br />
          resumido.
        </h1>
        <Dash />
        <Row label="Edición" value="2026-1" />
        <Row label="Slides" value="8" />
        <Row label="Plataforma" value="BuscaRamos" />
      </div>
    </TicketShell>
  );
}

function T1_MostLikes() {
  return (
    <TicketShell slip="01 · MÁS LIKES DEL SEMESTRE">
      <p
        className="font-black text-black leading-none mb-1"
        style={{ fontSize: "clamp(48px, 14vw, 68px)", fontFamily: "var(--font-barlow)" }}
      >
        IIC1103
      </p>
      <p className="text-xs font-bold text-black/50 mb-4">Introducción a la Programación</p>
      <Dash />
      <Row label="Likes" value="312" />
      <Row label="Recomendación" value="100%" />
      <Row label="Reseñas" value="27" />
      <Row label="Vibe" value="Muy positivas" />
    </TicketShell>
  );
}

function T2_Sleeper() {
  return (
    <TicketShell slip="02 · RAMO EN ASCENSO">
      <p
        className="font-black text-black leading-none mb-1"
        style={{ fontSize: "clamp(48px, 14vw, 68px)", fontFamily: "var(--font-barlow)" }}
      >
        IMT2200
      </p>
      <p className="text-xs font-bold text-black/50 mb-4">Ciencia de los Datos</p>
      <Dash />
      <Row label="Crecimiento" value="+184%" />
      <Row label="VS semestre anterior" value="↑ Sleeper" />
      <Row label="Tendencia" value="En alza" />
      <div className="mt-4 bg-black text-white px-4 py-3 self-start">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">el dato</p>
        <p
          className="font-black leading-none text-white mt-0.5"
          style={{ fontSize: "clamp(32px, 10vw, 48px)", fontFamily: "var(--font-barlow)" }}
        >
          +184%
        </p>
      </div>
    </TicketShell>
  );
}

function T3_Controversial() {
  return (
    <TicketShell slip="03 · EL MÁS POLÉMICO">
      <p
        className="font-black text-black leading-none mb-1"
        style={{ fontSize: "clamp(48px, 14vw, 68px)", fontFamily: "var(--font-barlow)" }}
      >
        FIL2001
      </p>
      <p className="text-xs font-bold text-black/50 mb-4">Ética Aplicada</p>
      <Dash />
      <Row label="A favor (ME)" value="52%" />
      <Row label="En contra (NEL)" value="48%" />
      <Row label="Veredicto" value="Divisivo" />
      <div className="flex gap-2 mt-4">
        <div className="flex-1 bg-black text-white p-3 text-[10px] font-bold italic">
          &ldquo;Cambió mi forma de pensar.&rdquo;
        </div>
        <div className="flex-1 border-2 border-black text-black p-3 text-[10px] font-bold italic">
          &ldquo;¡Jamás de los jamases!&rdquo;
        </div>
      </div>
    </TicketShell>
  );
}

function T4_HardLoved() {
  return (
    <TicketShell slip="04 · DIFÍCIL PERO AMADO">
      <p
        className="font-black text-black leading-none mb-1"
        style={{ fontSize: "clamp(48px, 14vw, 68px)", fontFamily: "var(--font-barlow)" }}
      >
        FIS1503
      </p>
      <p className="text-xs font-bold text-black/50 mb-4">Mecánica Clásica</p>
      <Dash />
      <Row label="Love score" value="9.1 / 10" />
      <Row label="Dificultad" value="Alta" />
      <Row label="Carga semanal" value="12 hrs" />
      <Row label="¿Lo recomiendan?" value="Igual sí" />
    </TicketShell>
  );
}

function T5_Special() {
  return (
    <TicketShell slip="05 · MENCIÓN ESPECIAL">
      <p
        className="font-black text-black leading-none mb-1"
        style={{ fontSize: "clamp(48px, 14vw, 68px)", fontFamily: "var(--font-barlow)" }}
      >
        ARQ1310
      </p>
      <p className="text-xs font-bold text-black/50 mb-4">Taller de Volumetría</p>
      <Dash />
      <Row label="Vibes" value="8.2 / 10" />
      <Row label="Categoría" value="Sufrimiento" />
      <div className="mt-4 border-l-4 border-black bg-black/5 p-3 text-[11px] font-bold italic text-black">
        &ldquo;No se lo deseo ni a mi peor enemigo&rdquo;
      </div>
    </TicketShell>
  );
}

function T6_BestFirstYear() {
  return (
    <TicketShell slip="06 · MEJOR RAMO DE PRIMER AÑO">
      <p
        className="font-black text-black leading-none mb-1"
        style={{ fontSize: "clamp(48px, 14vw, 68px)", fontFamily: "var(--font-barlow)" }}
      >
        MAT1610
      </p>
      <p className="text-xs font-bold text-black/50 mb-4">Cálculo I</p>
      <Dash />
      <Row label="Nota promedio" value="★ 4.7 / 5" />
      <Row label="Recomendación" value="98%" />
      <Row label="Para" value="Recién llegados" />
      <Row label="Consejo" value="Empezar con el pie derecho" />
    </TicketShell>
  );
}

function T7_Fin({ onShare }: { onShare: () => void }) {
  return (
    <TicketShell slip="FIN · GRACIAS POR USAR BUSCARAMOS" sig="♦♦♦ hasta el próximo semestre ♦♦♦">
      <div className="flex-1 flex flex-col justify-center gap-4">
        <h2
          className="font-black text-black leading-[0.85]"
          style={{ fontSize: "clamp(44px, 13vw, 62px)", fontFamily: "var(--font-barlow)" }}
        >
          HASTA EL
          <br />
          PRÓXIMO
          <br />
          SEMESTRE.
        </h2>
        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">
          @buscaramos · osuc.dev
        </p>
        <Dash />
        <div className="flex gap-2 relative z-20">
          <button
            className="flex-1 bg-black text-white py-3 text-[11px] font-black uppercase tracking-widest"
            onClick={(e) => e.stopPropagation()}
          >
            ↓ PNG
          </button>
          <button
            className="flex-1 border-2 border-black text-black py-3 text-[11px] font-black uppercase tracking-widest"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            ↑ LINK
          </button>
        </div>
      </div>
    </TicketShell>
  );
}

export function getTicketSlides(onShare: () => void): ReactNode[] {
  return [
    <T0_Cover key={0} />,
    <T1_MostLikes key={1} />,
    <T2_Sleeper key={2} />,
    <T3_Controversial key={3} />,
    <T4_HardLoved key={4} />,
    <T5_Special key={5} />,
    <T6_BestFirstYear key={6} />,
    <T7_Fin key={7} onShare={onShare} />,
  ];
}
