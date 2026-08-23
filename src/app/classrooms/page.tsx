import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClassroomSearch } from "@/components/courses/classrooms/ClassroomSearch";
import FreeClassrooms from "@/components/courses/classrooms/FreeClassrooms";
import { authenticateUser } from "@/lib/auth/auth";
import { BASE_URL, ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Salas",
  description: "Consulta salas libres y revisa su ocupación por módulo.",
};

export default async function ClassroomsPage() {
  const user = await authenticateUser();

  if (!user) {
    redirect(`https://auth.osuc.dev?ref=${encodeURIComponent(`${BASE_URL}${ROUTES.CLASSROOMS}`)}`);
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 tablet:px-6 lg:px-8">
        <header className="space-y-3 text-center lg:text-left">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">
            Salas
          </p>
          <h1 className="text-3xl font-bold tracking-tight tablet:text-4xl">Búsqueda de salas</h1>
          <p className="text-muted-foreground max-w-3xl text-sm tablet:text-base lg:max-w-4xl">
            Revisa salas disponibles por módulo y busca el horario de una sala específica.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
          <div>
            <FreeClassrooms />
          </div>

          <div className="space-y-6">
            <ClassroomSearch />
          </div>
        </section>
      </div>
    </main>
  );
}
