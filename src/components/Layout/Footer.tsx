import Link from "next/link";
import {
  DiscordIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  OSUCIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "@/components/icons/icons";
import { SOCIAL_LINKS } from "@/data/social-links";

export default function Footer() {
  return (
    <footer className="border-border mt-auto border-t py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 items-start gap-8 md:grid-cols-4">
          <Link href="https://osuc.dev/" className="flex font-semibold gap-4 items-center">
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center`}>
              <OSUCIcon color="black" />
            </span>
            <span className="text-5xl font-bold -translate-y-1">osuc</span>
          </Link>

          <div className="flex flex-col space-y-3">
            <h3 className="text-foreground text-sm font-medium">Plataforma</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogo"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Catálogo
                </Link>
              </li>
              <li>
                <Link
                  href="/contribuidores"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Contribuidores
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-foreground text-sm font-medium">Información OSUC</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://osuc.dev/about/"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Acerca de
                </Link>
              </li>
              <li>
                <Link
                  href="https://osuc.dev/conduct/"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Código de conducta
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="text-foreground text-sm font-medium">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="mailto:coord@osuc.dev"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:help@osuc.dev"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Ayuda
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col justify-between space-y-4 border-t pt-8 md:flex-row md:items-center md:space-y-0">
          <div className="text-muted-foreground text-sm">
            <span className="font-bold">Proyecto independiente de código abierto.</span> <br />
            No existe vinculación oficial con la Pontificia Universidad Católica de Chile.
            <p className="text-muted-foreground text-sm py-2">
              🄯 {new Date().getFullYear()} Open Source eUC.
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram OSUC"
            >
              <InstagramIcon className="w-5 h-5" />
            </Link>
            <Link
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="WhatsApp OSUC"
            >
              <WhatsAppIcon className="w-5 h-5" />
            </Link>
            <Link
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn OSUC"
            >
              <LinkedInIcon className="w-5 h-5" />
            </Link>
            <Link
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub OSUC"
            >
              <GitHubIcon className="w-5 h-5" />
            </Link>
            <Link
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Telegram OSUC"
            >
              <TelegramIcon className="w-5 h-5" />
            </Link>
            <Link
              href={SOCIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Discord OSUC"
            >
              <DiscordIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
