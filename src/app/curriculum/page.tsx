import ProgramTable from "@/components/curriculum/ProgramTable";

export default function CurriculumPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 tablet:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tablet:text-4xl">Mallas Curriculares</h1>
        <p className="text-muted-foreground max-w-3xl">
          Busca los cursos correspondientes a las mallas curriculares de tu carrera. Todo en un solo
          lugar.
        </p>
      </header>

      <ProgramTable />
    </main>
  );
}
