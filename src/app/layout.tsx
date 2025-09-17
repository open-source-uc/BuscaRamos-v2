import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/global.css";
import HeaderPage from "@/components/header/HeaderPage";
import { AuthProvider } from "@/context/authCtx";
import { Toaster } from "sonner";
import { generateMetadata } from "@/lib/metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <AuthProvider>
          <HeaderPage />
          <main role="main">
            {children}
          </main>
          <Toaster
            position="top-center"
            expand={true}
            richColors={true}
            closeButton={true}
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
