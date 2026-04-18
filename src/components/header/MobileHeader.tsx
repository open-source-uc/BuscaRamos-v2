"use client";

import { useState } from "react";
import { MenuIcon, CloseIcon } from "@/components/icons/icons";

import Link from "next/link";
import Image from "next/image";

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
];

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="tablet:hidden border-background flex w-full items-center px-4 py-4">
      <div className="flex w-full justify-between">
        <Link className="flex items-center gap-2 shrink-0 z-110" href={"/"}>
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

        <div className="flex items-center gap-2 z-110">
          <button
            onClick={toggleMenu}
            className="hover:bg-muted hover:text-muted-foreground rounded-md p-2 transition-colors"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? (
              <CloseIcon className="fill-foreground h-6 w-6" />
            ) : (
              <MenuIcon className="fill-foreground h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="tablet:hidden bg-background fixed inset-x-0 bottom-0 top-24 flex flex-col">
          {/* Menu content - scrollable */}
          <div className="flex flex-1 flex-col space-y-8 overflow-y-auto p-6">
            {/* Account section */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold text-nowrap">
                Cuenta OSUC
              </h3>
              <div className="space-y-3">
                <a
                  href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
                  onClick={closeMenu}
                  className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                >
                  INICIAR SESIÓN
                </a>
              </div>
            </section>

            {/* Navigation section */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">Navegación</h3>
              <div className="space-y-3">
                <Link
                  href="/catalogo"
                  onClick={closeMenu}
                  className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                >
                  CATÁLOGO
                </Link>
                <Link
                  href="/horario"
                  onClick={closeMenu}
                  className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                >
                  HORARIO
                </Link>
                <Link
                  href="/contribuidores"
                  onClick={closeMenu}
                  className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                >
                  CONTRIBUIDORES
                </Link>
              </div>
            </section>

            {/* FAQ section */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">FAQ</h3>
              <div className="space-y-3">
                {components.map((component) => (
                  <a
                    key={component.title}
                    href={component.href}
                    onClick={closeMenu}
                    className="border-border hover:bg-primary-light hover:text-primary hover:border-primary block rounded-md border p-4 transition-colors"
                  >
                    <div className="text-foreground text-sm leading-none font-medium">
                      {component.title}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-snug">
                      {component.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            {/* Quick links */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">Enlaces Rápidos</h3>
              <div className="grid grid-cols-1 gap-3">
                <a
                  href="https://buscacursos.uc.cl/"
                  onClick={closeMenu}
                  className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-md border px-4 py-3 text-center text-sm font-medium transition-colors duration-200"
                >
                  BUSCACURSOS
                </a>
                <a
                  href="https://registration9.uc.cl/StudentRegistrationSsb/ssb/registration"
                  onClick={closeMenu}
                  className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-md border px-4 py-3 text-center text-sm font-medium transition-colors duration-200"
                >
                  INSCRIPCIÓN CURSOS
                </a>
              </div>
            </section>
          </div>
        </div>
      )}
    </header>
  );
}
