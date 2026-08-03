import { CodeXmlIcon, HeartIcon } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

export default function ContributeCard() {
  return (
    <div className="border-border bg-card rounded-xl border p-8 text-center transition-shadow duration-300 hover:shadow-lg">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border bg-muted">
        <GitHubIcon className="h-7 w-7" />
      </div>

      <h2 className="text-foreground mb-3 text-3xl font-bold">Construyamos esto juntos</h2>

      <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
        Esta plataforma existe gracias a estudiantes que aportan ideas, código y mejoras. Si te
        interesa ayudar a otros estudiantes, puedes contribuir al proyecto en GitHub.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col items-center gap-2 border rounded-lg p-4 transition-shadow duration-300 hover:shadow-md">
          <CodeXmlIcon className="h-6 w-6 text-foreground" fillOpacity={0} />
          <h3 className="font-semibold">Código abierto</h3>
          <p className="text-muted-foreground text-sm">
            Mejora la plataforma creando nuevas funcionalidades.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 border rounded-lg p-4 transition-shadow duration-300 hover:shadow-md">
          <HeartIcon className="text-foreground h-6 w-6" />
          <h3 className="font-semibold">Ayuda a la comunidad</h3>
          <p className="text-muted-foreground text-sm">
            Tus aportes pueden beneficiar a miles de estudiantes.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 border rounded-lg p-4 transition-shadow duration-300 hover:shadow-md">
          <GitHubIcon className="text-foreground h-6 w-6" />
          <h3 className="font-semibold">Únete al proyecto</h3>
          <p className="text-muted-foreground text-sm">
            Revisa issues, propone ideas o aporta código.
          </p>
        </div>
      </div>

      <Button
        className="mt-5"
        size="lg"
        href="https://github.com/open-source-uc/BuscaRamos-v2"
        icon={GitHubIcon}
      >
        Contribuir en GitHub
      </Button>
    </div>
  );
}
