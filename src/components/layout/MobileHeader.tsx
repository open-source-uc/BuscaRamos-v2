"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { MenuIcon, CloseIcon } from "@/components/icons/Icons";
import { AuthContext } from "@/context/authCtx";

import Link from "next/link";
import Image from "next/image";

import logo from "@/public/logos/buscaramos-logo.svg";
import { ROUTES, HEADER_LINKS, FAQ_SECTIONS } from "@/lib/routes";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  // Distancia desde el top del viewport hasta el borde inferior del header.
  // Se mide en runtime porque el header puede estar desplazado por el Banner.
  const [menuTop, setMenuTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const { user, isLoading } = use(AuthContext);

  const measureMenuTop = useCallback(() => {
    const element = headerRef.current;
    if (!element) return;

    // El header sticky externo agrega padding alrededor de este; medimos ese
    // para que el overlay arranque justo bajo el borde visible.
    const outerHeader = element.parentElement?.closest("header") ?? element;
    setMenuTop(outerHeader.getBoundingClientRect().bottom);
  }, []);

  const toggleMenu = () => {
    if (!isOpen) measureMenuTop();
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Con el menú abierto bloqueamos el scroll: si la página se moviera, el header
  // sticky subiría y el overlay (fixed) quedaría desalineado.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("resize", measureMenuTop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", measureMenuTop);
    };
  }, [isOpen, measureMenuTop]);

  return (
    <header
      ref={headerRef}
      className="tablet:hidden border-background flex w-full items-center px-2"
    >
      <div className="flex w-full justify-between">
        <Link className="flex items-center gap-1 shrink-0 z-110" href={"/"} onClick={closeMenu}>
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
        <div
          className="tablet:hidden bg-background fixed inset-x-0 bottom-0 z-100 flex flex-col"
          style={{ top: menuTop }}
        >
          {/* Menu content - scrollable */}
          <div className="flex flex-1 flex-col space-y-8 overflow-y-auto p-6">
            {/* Account section */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold text-nowrap">
                Cuenta OSUC
              </h3>
              <div className="space-y-3">
                {user ? (
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={closeMenu}
                    className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                  >
                    MI PERFIL
                  </Link>
                ) : (
                  <a
                    href={`https://auth.osuc.dev/?ref=${typeof window !== "undefined" ? new URL(window.location.href).toString() : ""}`}
                    onClick={closeMenu}
                    className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                  >
                    {isLoading ? "CARGANDO..." : "INICIAR SESIÓN"}
                  </a>
                )}
              </div>
            </section>

            {/* Navigation section */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">Navegación</h3>
              <div className="space-y-3">
                {HEADER_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="bg-background text-input border-border hover:bg-primary-foreground hover:text-primary hover:border-primary inline-block w-full rounded-lg border px-4 py-2 text-center text-sm font-medium transition-colors duration-200"
                  >
                    {label.toUpperCase()}
                  </Link>
                ))}
              </div>
            </section>

            {/* FAQ section */}
            <section className="border-border rounded-md border p-6">
              <h3 className="text-foreground mb-4 text-lg font-semibold">FAQ</h3>
              <div className="space-y-3">
                {FAQ_SECTIONS.map((section) => (
                  <a
                    key={section.title}
                    href={section.href}
                    onClick={closeMenu}
                    className="border-border hover:bg-primary-foreground hover:text-primary hover:border-primary block rounded-md border p-4 transition-colors"
                  >
                    <div className="text-foreground text-sm leading-none font-medium">
                      {section.title}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-snug">
                      {section.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </header>
  );
}
