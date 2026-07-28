"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AuthContext } from "@/context/authCtx";

import Link from "next/link";
import Image from "next/image";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  ListItem,
} from "@/components/layout/NavigationMenu";
import { ROUTES, HEADER_LINKS, FAQ_SECTIONS } from "@/lib/routes";
import MobileHeader from "@/components/layout/MobileHeader";
import logo from "@/public/logos/buscaramos-logo.svg";

export default function HeaderPage() {
  const router = useRouter();
  const { user, isLoading } = use(AuthContext);

  const handleGoToProfile = () => {
    if (!user) {
      router.push("https://auth.osuc.dev?ref=" + window.location.href);
      return;
    }
    router.push(ROUTES.PROFILE);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-surface p-5 flex items-center justify-between">
      <MobileHeader />

      {/* Izquierda: título y subtítulo */}
      <Link className="hidden tablet:flex items-center gap-1 shrink-0" href={"/"}>
        <Image
          src={logo}
          alt="BuscaRamos - Logotipo principal"
          priority
          className="h-10 w-10 object-contain"
        />

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-semibold leading-none">
            Busca
            <span className="text-osuc">Ramos</span>
          </h1>
        </div>
      </Link>

      <nav className="hidden tablet:flex flex-1 px-4">
        <NavigationMenu>
          <NavigationMenuList>
            {HEADER_LINKS.map(({ label, href }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href={href} className="hover:bg-muted">
                    {label.toUpperCase()}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="data-[state=open]:bg-muted hover:bg-muted">
                FAQ
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                  {FAQ_SECTIONS.map((section) => (
                    <ListItem key={section.title} title={section.title} href={section.href}>
                      {section.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Derecha: botón de perfil */}
      <Button
        className="hidden tablet:flex shrink-0 font-semibold px-4"
        size="sm"
        variant="ghost_border"
        onClick={handleGoToProfile}
      >
        {isLoading ? "Cargando..." : user ? "Mi perfil" : "Iniciar sesión"}
      </Button>
    </header>
  );
}
