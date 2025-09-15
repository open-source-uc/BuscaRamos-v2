import CoursesTable from "@/components/CoursesTable";

export const runtime = "edge";

export default async function CatalogPage() {
  return (
    <main className="flex justify-center items-center p-4 flex-col">
      <h1>Esto es develop</h1>
      <CoursesTable />
    </main>
  );
}
