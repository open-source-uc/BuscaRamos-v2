import CoursesTable from "@/components/CoursesTable";
import type { Metadata } from "next";

export const runtime = "edge";

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

export default async function CatalogPage() {
  return (
    <main className="flex justify-center items-center p-4 flex-col">
      <CoursesTable />
    </main>
  );
}
