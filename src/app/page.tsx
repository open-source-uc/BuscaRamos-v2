import AdvantagesInfo from "@/components/Landing/AdvantagesInfo";
import GettingStarted from "@/components/Landing/GettingStarted";
import LandingSearch from "@/components/Landing/LandingSearch";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BuscaRamos - Catálogo Cursos",
  description:
    "Encuentra información detallada, reseñas de estudiantes y requisitos para cada ramo.",
  keywords: "cursos, ramos, catálogo académico, reseñas estudiantes, requisitos",
  openGraph: {
    title: "BuscaRamos - Catálogo Cursos",
    description:
      "Explora todos los cursos. Encuentra información detallada, reseñas de estudiantes y requisitos para cada ramo.",
    type: "website",
    url: "https://buscaramos.osuc.dev",
    siteName: "BuscaRamos",
    images: [
      {
        url: "/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "BuscaRamos - Catálogo Cursos",
      },
    ],
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuscaRamos - Catálogo Cursos",
    description:
      "Explora todos los cursos. Encuentra información detallada, reseñas de estudiantes y requisitos para cada ramo.",
    images: ["/images/opengraph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://buscaramos.osuc.dev",
  },
};

export default async function HomePage() {
  return (
    <main className="flex bg-white justify-center items-center p-4 flex-col w-full max-w-full overflow-hidden">
      <section className="w-full max-w-7xl">
        <LandingSearch />
      </section>

      <section className="tablet:py-20 mx-auto max-w-6xl px-4 py-16">
        <AdvantagesInfo />
      </section>

      <section className="tablet:py-20 mx-auto max-w-6xl px-4 py-16">
        <GettingStarted />
      </section>
    </main>
  );
}
