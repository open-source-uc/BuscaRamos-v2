import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/global.css";
import Header from "@/components/header/Header";
import FloatingNavButton from "@/components/FloatingNavButton";
import { AuthProvider } from "@/context/authCtx";
import { CourseNameMapProvider } from "@/context/courseNameMapCtx";
import { SemesterProvider } from "@/context/semesterCtx";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    template: "%s | BuscaRamos",
    default: "BuscaRamos - Catálogo Cursos",
  },
  description: "BuscaRamos - Encuentra y comparte opiniones sobre cursos universitarios.",
  keywords: "ramos, catálogo académico, reseñas estudiantes",
  authors: [{ name: "BuscaRamos Team" }],
  creator: "BuscaRamos",
  publisher: "BuscaRamos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://buscaramos.osuc.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://buscaramos.osuc.dev",
    siteName: "BuscaRamos",
    title: "BuscaRamos - Catálogo de Cursos",
    description: "Encuentra y comparte opiniones sobre cursos universitarios.",
    images: [
      {
        url: "/images/opengraph.png",
        width: 1200,
        height: 630,
        alt: "BuscaRamos - Catálogo de Cursos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuscaRamos - Catálogo de Cursos",
    description: "Encuentra y comparte opiniones sobre cursos universitarios",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <head>
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "7874d2302e154e14ab08e25ea85909f9"}'
        />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <SemesterProvider>
          <CourseNameMapProvider>
            <AuthProvider>
              <Header />
              {children}
              <Toaster
                position="top-center"
                expand={true}
                richColors={true}
                closeButton={true}
                duration={4000}
              />
              <FloatingNavButton />
            </AuthProvider>
          </CourseNameMapProvider>
        </SemesterProvider>
      </body>
    </html>
  );
}
