import type { ReactNode } from "react";

function Star({
  size = 140,
  rotate = 0,
  id,
  className = "",
}: {
  size?: number;
  rotate?: number;
  id: string;
  className?: string;
}) {
  const gid = `sg-${id}`;
  return (
    <div className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE000" />
            <stop offset="25%" stopColor="#FF4400" />
            <stop offset="50%" stopColor="#FF00BB" />
            <stop offset="75%" stopColor="#7700FF" />
            <stop offset="100%" stopColor="#00CCFF" />
          </linearGradient>
        </defs>
        <path
          d="M100,10 L115,63 L164,36 L137,85 L190,100 L137,115 L164,164 L115,137 L100,190 L85,137 L36,164 L63,115 L10,100 L63,85 L36,36 L85,63 Z"
          fill={`url(#${gid})`}
        />
      </svg>
    </div>
  );
}

function Label({ children, invert }: { children: ReactNode; invert?: boolean }) {
  return (
    <span
      className={`inline-block text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-3 ${
        invert ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      {children}
    </span>
  );
}

function Code({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <h2
      className={`font-black uppercase leading-[0.85] ${light ? "text-white" : "text-black"}`}
      style={{ fontSize: "clamp(58px, 17vw, 88px)" }}
    >
      {children}
    </h2>
  );
}

function Name({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`text-sm font-bold mt-1 mb-2 ${light ? "text-white/60" : "text-black/60"}`}>
      {children}
    </p>
  );
}

function StatBox({ value, label, light }: { value: string; label: string; light?: boolean }) {
  return (
    <div
      className={`inline-flex flex-col px-5 py-3 mt-2 mb-2 ${light ? "bg-white text-black" : "bg-black text-white"}`}
    >
      <span className="font-black leading-none" style={{ fontSize: "clamp(38px, 11vw, 56px)" }}>
        {value}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mt-0.5">
        {label}
      </span>
    </div>
  );
}

function Bullets({ items, light }: { items: string[]; light?: boolean }) {
  return (
    <ul className="mt-1 space-y-1.5">
      {items.map((item) => (
        <li
          key={item}
          className={`flex items-center gap-2 text-[11px] font-black uppercase ${light ? "text-white" : "text-black"}`}
        >
          <span aria-hidden className="text-[8px]">
            ◆
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Footer({ light = true }: { light?: boolean }) {
  return (
    <p
      className={`absolute bottom-4 left-0 right-0 text-center text-[9px] font-black uppercase tracking-[0.25em] ${light ? "text-white/30" : "text-black/30"}`}
    >
      BUSCARAMOS · WRAP 26-1
    </p>
  );
}

function S0_Cover() {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 pt-12"
      style={{ background: "#FF3300" }}
    >
      <Star
        size={180}
        rotate={12}
        id="s0a"
        className="absolute -top-8 right-0 pointer-events-none"
      />
      <Star
        size={80}
        rotate={-18}
        id="s0b"
        className="absolute bottom-20 -left-4 pointer-events-none"
      />

      <div className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full self-start">
        BUSCARAMOS WRAP
      </div>

      <h1
        className="text-white font-black uppercase leading-[0.85]"
        style={{ fontSize: "clamp(72px, 22vw, 100px)" }}
      >
        TU
        <br />
        SEM
        <br />
        EN 8
        <br />
        SLIDES
      </h1>

      <div className="pb-10">
        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">ed. 2026-1</p>
        <p className="text-white font-black text-xl uppercase mt-1">TAP →</p>
      </div>

      <Footer />
    </div>
  );
}

function S1_MostLikes() {
  return (
    <div
      className="relative w-full h-full flex flex-col p-6 pt-12"
      style={{ background: "#0A0A0A" }}
    >
      <Star
        size={165}
        rotate={8}
        id="s1a"
        className="absolute -top-6 right-0 pointer-events-none"
      />
      <Label invert>01 · Más likes del semestre</Label>
      <Code light>IIC1103</Code>
      <Name light>Introducción a la Programación</Name>
      <StatBox value="312" label="LIKES" light />
      <Bullets light items={["100% recomendación", "27 reseñas", "Sumamente positivas"]} />
      <Footer />
    </div>
  );
}

function S2_Sleeper() {
  return (
    <div
      className="relative w-full h-full flex flex-col p-6 pt-12"
      style={{ background: "#BBFF00" }}
    >
      <Star
        size={160}
        rotate={-5}
        id="s2a"
        className="absolute -top-6 right-0 pointer-events-none"
      />
      <Label>02 · Ramo en ascenso</Label>
      <p className="text-black/50 text-[11px] font-black uppercase tracking-widest mb-1">IMT2200</p>
      <h2
        className="text-black font-black uppercase leading-[0.85]"
        style={{ fontSize: "clamp(58px, 17vw, 84px)" }}
      >
        ↗ SLEEPER
      </h2>
      <p className="text-black/60 text-sm font-bold mt-2">Ciencia de los Datos</p>
      <div className="mt-auto mb-14 bg-black text-white px-5 py-4 self-stretch">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
          VS SEM. ANTERIOR
        </p>
        <p className="font-black leading-none" style={{ fontSize: "clamp(50px, 15vw, 76px)" }}>
          +184%
        </p>
      </div>
      <Footer light={false} />
    </div>
  );
}

function S3_Controversial() {
  return (
    <div
      className="relative w-full h-full flex flex-col p-6 pt-12"
      style={{ background: "#FF0066" }}
    >
      <Star
        size={160}
        rotate={20}
        id="s3a"
        className="absolute -top-6 right-0 pointer-events-none"
      />
      <Label>03 · El más polémico</Label>
      <Code>FIL2001</Code>
      <Name>Ética Aplicada</Name>
      <div className="flex gap-2 mt-3">
        <div className="flex-1 bg-white text-black flex items-baseline justify-center gap-1.5 py-3">
          <span className="font-black text-4xl leading-none">52</span>
          <span className="text-xs font-black">ME</span>
        </div>
        <div className="flex-1 bg-black text-white flex items-baseline justify-center gap-1.5 py-3">
          <span className="font-black text-4xl leading-none">48</span>
          <span className="text-xs font-black">NEL</span>
        </div>
      </div>
      <div className="mt-3 bg-white text-black p-3 text-sm font-bold italic">
        &ldquo;Cambió mi forma de pensar.&rdquo;
      </div>
      <div className="mt-2 bg-black text-white p-3 text-sm font-bold italic">
        &ldquo;¡Jamás de los jamases!&rdquo;
      </div>
      <Footer />
    </div>
  );
}

function S4_HardLoved() {
  return (
    <div
      className="relative w-full h-full flex flex-col p-6 pt-12"
      style={{ background: "#00665A" }}
    >
      <Star
        size={160}
        rotate={-10}
        id="s4a"
        className="absolute -top-6 right-0 pointer-events-none"
      />
      <Label invert>04 · Difícil pero amado</Label>
      <Code light>FIS1503</Code>
      <Name light>Mecánica Clásica</Name>
      <StatBox value="9.1" label="LOVE / 10" light />
      <Bullets light items={["Dificultad: Alta", "12 hrs / sem", "Y aún así lo recomendarían"]} />
      <Footer />
    </div>
  );
}

function S5_Special() {
  return (
    <div
      className="relative w-full h-full flex flex-col p-6 pt-12"
      style={{ background: "#FFD700" }}
    >
      <Star
        size={160}
        rotate={5}
        id="s5a"
        className="absolute -top-6 right-0 pointer-events-none"
      />
      <Label>05 · Mención especial</Label>
      <Code>ARQ1310</Code>
      <Name>Taller de Volumetría</Name>
      <div className="mt-2 bg-black text-white inline-flex flex-col px-5 py-3 self-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
          VIBES / 10
        </span>
        <span className="font-black leading-none" style={{ fontSize: "clamp(42px, 12vw, 60px)" }}>
          8.2
        </span>
      </div>
      <div className="mt-4 bg-white text-black p-4 text-sm font-bold italic border-l-4 border-black">
        &ldquo;No se lo deseo ni a mi peor enemigo&rdquo;
      </div>
      <Footer light={false} />
    </div>
  );
}

function S6_BestFirstYear() {
  return (
    <div
      className="relative w-full h-full flex flex-col p-6 pt-12"
      style={{ background: "#4400FF" }}
    >
      <Star
        size={160}
        rotate={-15}
        id="s6a"
        className="absolute -top-6 right-0 pointer-events-none"
      />
      <Label invert>06 · Mejor ramo de primer año</Label>
      <Code light>MAT1610</Code>
      <Name light>Cálculo I</Name>
      <StatBox value="★ 4.7" label="DE 5" light />
      <Bullets
        light
        items={["98% recomendación", "Para los recién llegados", "Empezar con el pie derecho"]}
      />
      <Footer />
    </div>
  );
}

function S7_Fin({ onShare }: { onShare: () => void }) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-between p-6 pt-12"
      style={{ background: "#8800CC" }}
    >
      <Star
        size={170}
        rotate={10}
        id="s7a"
        className="absolute -top-8 right-0 pointer-events-none"
      />
      <Star
        size={75}
        rotate={-20}
        id="s7b"
        className="absolute bottom-28 -left-5 pointer-events-none"
      />

      <div className="flex-1 flex flex-col justify-center">
        <span className="inline-block bg-white text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 self-start mb-5">
          + FIN +
        </span>
        <h2
          className="text-white font-black uppercase leading-[0.85]"
          style={{ fontSize: "clamp(76px, 23vw, 108px)" }}
        >
          COMPLE
          <br />
          TELO.
        </h2>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-5">
          @buscaramos · osuc.dev
        </p>
      </div>

      <div className="flex gap-3 pb-12 relative z-20">
        <button
          className="flex-1 bg-white text-black py-3 text-[11px] font-black uppercase tracking-widest"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          ↓ PNG
        </button>
        <button
          className="flex-1 border-2 border-white text-white py-3 text-[11px] font-black uppercase tracking-widest"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
        >
          ↑ LINK
        </button>
      </div>

      <Footer />
    </div>
  );
}

export function getBoldSlides(onShare: () => void): ReactNode[] {
  return [
    <S0_Cover key={0} />,
    <S1_MostLikes key={1} />,
    <S2_Sleeper key={2} />,
    <S3_Controversial key={3} />,
    <S4_HardLoved key={4} />,
    <S5_Special key={5} />,
    <S6_BestFirstYear key={6} />,
    <S7_Fin key={7} onShare={onShare} />,
  ];
}
