import ProgramTable from "@/components/curriculum/ProgramTable";
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

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 tablet:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tablet:text-4xl">Mallas Curriculares</h1>
        <p className="text-muted-foreground max-w-3xl">
          Busca las reseñas de los cursos correspondientes a la malla curricular de tu carrera. Todo
          en un solo lugar.
        </p>
      </header>

      <ProgramTable programs={programsWithCourses} />
    </main>
  );
}
