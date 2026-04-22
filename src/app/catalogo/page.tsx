import { connection } from "next/server";
import CoursesTable from "@/components/CoursesTable";

export default async function CatalogPage() {
  await connection();
  return (
    <div className="flex justify-center items-center p-4 flex-col w-full max-w-full overflow-hidden">
      <div className="w-full max-w-7xl">
        <CoursesTable />
      </div>
    </div>
  );
}
