"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/authCtx";

import Link from "next/link";
import Image from "next/image";

import NavbarLink from "@/components/header/NavbarLink";
import logo from "@/public/logos/dark-osuc-logo.svg";

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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white py-5 px-10 flex items-center justify-between shadow-sm">
      {/* Izquierda: título y subtítulo */}
      <Link className="flex items-center gap-3" href={"/"}>
        <Image
          src={logo}
          alt="BuscaRamos - Logotipo principal"
          priority
          className="h-10 w-10 object-contain"
        />

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-semibold leading-none">BuscaRamos</h1>
          <span className="text-xs font-semibold leading-none">
            by{" "}
            <a
              href="https://osuc.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              OSUC
            </a>
          </span>
        </div>
      </Link>

      <nav className="flex-1 px-20">
        <ul className="flex gap-5">
          <li>
            <NavbarLink href="catalogo">CATÁLOGO</NavbarLink>
          </li>

          <li>
            <NavbarLink href="horario">HORARIO</NavbarLink>
          </li>

          <li>
            <NavbarLink href="creditos">CONTRIBUIDORES</NavbarLink>
          </li>
        </ul>
      </nav>

      {/* Derecha: botón de perfil */}
      <Button size="sm" onClick={handleGoToProfile}>
        {isLoading ? "Cargando..." : user ? "Mi Perfil" : "Iniciar Sesión"}
      </Button>
    </header>
  );
}
