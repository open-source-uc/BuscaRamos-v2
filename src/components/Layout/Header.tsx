"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
} from "@/components/Layout/NavigationMenu";
import MobileHeader from "@/components/Layout/MobileHeader";
import logo from "@/public/logos/dark-osuc-logo.svg";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Sobre las Áreas de Formación General",
    href: "https://formaciongeneral.uc.cl/sobre-la-formacion-general/#conoce-las-%c3%a1reas-formativas",
    description: "Conoce las áreas de formación general y cómo se relacionan con los cursos.",
  },
  {
    title: "Preguntas Frecuentes",
    href: "https://registrosacademicos.uc.cl/informacion-para-estudiantes/inscripcion-y-retiro-de-cursos/preguntas-frecuentes/",
    description: "Resuelve tus dudas sobre los cursos: inscripciones, retiros y más.",
  },
  {
    title: "Inscripción de Cursos",
    href: "https://registration9.uc.cl/StudentRegistrationSsb/ssb/registration",
    description: "Añade o elimina clases según tu horario asignado por banner.",
  },
  {
    title: "Buscacursos UC",
    href: "https://buscacursos.uc.cl/",
    description: "La fuente oficial de la universidad para revisar la programación académica.",
  },
];

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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white p-5 flex items-center justify-between shadow-sm">
      <MobileHeader />

      {/* Izquierda: título y subtítulo */}
      <Link className="hidden tablet:flex items-center gap-2 shrink-0" href={"/"}>
        <Image
          src={logo}
          alt="BuscaRamos - Logotipo principal"
          priority
          className="h-10 w-10 object-contain"
        />

        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-semibold leading-none">BuscaRamos</h1>
          <span className="text-xs font-semibold leading-none">
            by <span className="text-blue-500">OSUC</span>
          </span>
        </div>
      </Link>

      <nav className="hidden tablet:flex flex-1 p-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/catalogo" className="hover:bg-muted">
                  CATÁLOGO
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/horario" className="hover:bg-muted">
                  HORARIO
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href="/contribuidores" className="hover:bg-muted">
                  CONTRIBUIDORES
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>FAQ</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-100 gap-3 p-4 md:w-125 md:grid-cols-2 lg:w-150">
                  {components.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href}>
                      {component.description}
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
        className="hidden tablet:flex shrink-0 font-bold px-4"
        size="sm"
        variant="black"
        onClick={handleGoToProfile}
      >
        {isLoading ? "Cargando..." : user ? "MI PERFIL" : "INICIAR SESIÓN"}
      </Button>
    </header>
  );
}
