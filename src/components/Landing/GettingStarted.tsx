import { SearchIcon, ThumbUpIcon, EditIcon } from "@/components/icons/icons";

export default function GettingStarted() {
  return (
    <div>
      <div className="mb-12 text-center">
        <h2 className="tablet:text-3xl desktop:text-4xl text-foreground mb-4 text-2xl font-bold">
          Así de fácil es empezar
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          En solo 3 pasos tendrás acceso a toda la información que necesitas
        </p>
      </div>

      <div className="mx-auto mb-12 flex max-w-2xl items-center justify-center">
        <div className="flex w-full items-center">
          <div className="border-border bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold">
            1
          </div>
          <div className="bg-border mx-2 h-1 flex-1"></div>
          <div className="border-border bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold">
            2
          </div>
          <div className="bg-border mx-2 h-1 flex-1"></div>
          <div className="border-border bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold">
            3
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border-border hover:border-green/30 group rounded-md border p-6 transition-all duration-300">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-green-light text-green border-green/20 rounded-lg border p-2 transition-transform duration-300 group-hover:scale-110">
              <SearchIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">Primer paso</h3>
              <p className="text-lg font-semibold">Busca tu curso</p>
            </div>
          </div>
          <div className="text-muted-foreground mb-4 text-sm">
            Utiliza nuestro buscador inteligente para encontrar el curso que te interesa. Busca por
            nombre o sigla.
          </div>
          <div className="text-green flex items-center gap-2 text-xs font-medium">
            <div className="bg-green h-2 w-2 rounded-full"></div>
            Búsqueda instantánea
          </div>
        </div>

        <div className="border-border hover:border-blue/30 group rounded-md border p-6 transition-all duration-300">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-blue-light text-blue border-blue/20 rounded-lg border p-2 transition-transform duration-300 group-hover:scale-110">
              <ThumbUpIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">Segundo paso</h3>
              <p className="text-lg font-semibold">Revisa la información</p>
            </div>
          </div>
          <div className="text-muted-foreground mb-4 text-sm">
            Explora reseñas auténticas y estadísticas detalladas. Toma decisiones informadas con
            datos reales.
          </div>
          <div className="text-blue flex items-center gap-2 text-xs font-medium">
            <div className="bg-blue h-2 w-2 rounded-full"></div>
            Datos co-creados
          </div>
        </div>

        <div className="border-border hover:border-purple/30 group rounded-md border p-6 transition-all duration-300">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-purple-light text-purple border-purple/20 rounded-lg border p-2 transition-transform duration-300 group-hover:scale-110">
              <EditIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">Tercer paso</h3>
              <p className="text-lg font-semibold">Comparte tu experiencia</p>
            </div>
          </div>
          <div className="text-muted-foreground mb-4 text-sm">
            Después de cursar tu ramo, ayuda a otros estudiantes compartiendo tu experiencia y tips
            en una reseña.
          </div>
          <div className="text-purple flex items-center gap-2 text-xs font-medium">
            <div className="bg-purple h-2 w-2 rounded-full"></div>
            Contribuye a la comunidad
          </div>
        </div>
      </div>
    </div>
  );
}
