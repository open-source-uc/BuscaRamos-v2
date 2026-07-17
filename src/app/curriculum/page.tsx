import ProgramCurriculum from "@/components/curriculum/ProgramCurriculum";
import ProgramTable from "@/components/curriculum/ProgramTable";
import { authenticateUser } from "@/lib/auth/auth";
import { getProgramWithCourses } from "@/lib/programCurriculum";
import { getPrograms } from "@/lib/programs";

export default async function CurriculumPage() {
  const programs = getPrograms();

  const programsWithCourses = await Promise.all(
    programs.map(async (program) => ({
      ...program,
      semesters: await getProgramWithCourses(program),
    }))
  );

  const user = await authenticateUser();
  const program = programsWithCourses.find((p) => p.name === user?.career?.name);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 tablet:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tablet:text-4xl">Mallas Curriculares</h1>
        <p className="text-muted-foreground max-w-3xl">
          Busca las reseñas de los cursos correspondientes a la malla curricular de tu carrera. Todo
          en un solo lugar.
        </p>
      </header>

      {program && (
        <section className="border-border bg-card rounded-xl border">
          <div className="border-border border-b px-6 py-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold uppercase tracking-wide">Tu carrera</span>

              <h2 className="text-2xl font-bold">{program.name}</h2>

              <p className="text-muted-foreground text-sm">
                Aquí puedes explorar la malla curricular de tu carrera y acceder rápidamente a las
                reseñas de cada ramo.
              </p>
            </div>
          </div>

          <div className="px-4">
            <ProgramCurriculum program={program} />
          </div>
        </section>
      )}
      <ProgramTable programs={programsWithCourses} />
    </main>
  );
}
