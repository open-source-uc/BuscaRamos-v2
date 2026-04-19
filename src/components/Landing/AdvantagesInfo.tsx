import { ThumbUpIcon, WorkloadIcon, ResourcesIcon } from "@/components/icons/icons";

export default function AdvantagesInfo() {
  return (
    <div>
      <div className="mb-12 text-center">
        <h2 className="tablet:text-3xl desktop:text-4xl text-foreground mb-4 text-2xl font-bold">
          De estudiantes para estudiantes
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          La plataforma de estudiantes para estudiantes UC que te ayuda a tomar decisiones
          informadas sobre tus ramos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="border-border bg-card rounded-md border p-6 transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-green-light text-green border-green/20 rounded-lg border p-3">
              <ThumbUpIcon className="h-6 w-6 fill-current" />
            </div>
            <h3 className="text-xl font-semibold">Reseñas auténticas</h3>
          </div>
          <p className="text-muted-foreground">
            Opiniones auténticas de estudiantes que ya cursaron los ramos. Conoce la verdadera
            experiencia antes de inscribirte.
          </p>
        </div>

        <div className="border-border bg-card rounded-md border p-6 transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-blue-light text-blue border-blue/20 rounded-lg border p-3">
              <WorkloadIcon className="h-6 w-6 fill-current" />
            </div>
            <h3 className="text-xl font-semibold">Información precisa</h3>
          </div>
          <p className="text-muted-foreground">
            Carga académica, asistencia requerida y más datos. Toda la información que necesitas en
            un solo lugar.
          </p>
        </div>

        <div className="border-border bg-card rounded-md border p-6 transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-purple-light text-purple border-purple/20 rounded-lg border p-3">
              <ResourcesIcon className="h-6 w-6 fill-current" />
            </div>
            <h3 className="text-xl font-semibold">Recursos académicos</h3>
          </div>
          <p className="text-muted-foreground">
            Accede a materiales de estudio, recomendaciones y recursos compartidos por la comunidad
            estudiantil.
          </p>
        </div>
      </div>
    </div>
  );
}
