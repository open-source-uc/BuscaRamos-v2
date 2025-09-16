"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/authCtx";
import Link from "next/link";

export default function HeaderPage() {
  const router = useRouter();
  const { user, isLoading } = use(AuthContext);

  const handleGoToProfile = () => {
    if (!user) {
      router.push("https://auth.osuc.dev?ref=" + window.location.href);
      return;
    }
    router.push("/profile");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Izquierda: título y subtítulo */}
      <div className="flex flex-col">
        <Link href={"/"}>
          <h1 className="text-lg font-semibold">BuscaRamos</h1>
        </Link>
        <a
          href="https://osuc.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-shadow-muted-foreground underline"
        >
          Creado y mantenido por OSUC
        </a>
      </div>

      {/* Derecha: botón de perfil */}
      <Button size="sm" onClick={handleGoToProfile}>
        {isLoading ? "Cargando..." : user ? "Mi Perfil" : "Iniciar Sesión"}
      </Button>
    </header>
  );
}
