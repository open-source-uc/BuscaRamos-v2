import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-20">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex flex-col text-center md:text-left space-y-6">
          <h1 className="text-9xl font-black text-black">404</h1>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Página no encontrada
            </h2>
            <p className="text-slate-500 text-lg max-w-md">
              Lo sentimos, no pudimos encontrar la página que buscas. Tal vez la dirección es
              incorrecta o la página ha sido movida.
            </p>
          </div>

          <Button variant="outline" href="/" size="lg">
            Volver al inicio
          </Button>
        </div>

        <SearchX
          size={220}
          strokeWidth={1.5}
          className="hidden tablet:flex relative text-transparent stroke-black drop-shadow-sm"
        />
      </div>
    </div>
  );
}
