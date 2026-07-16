import type { Program } from "@/types/types";
import Link from "next/link";

interface ProgramCurriculumProps {
  program: Program;
}

export default function ProgramCurriculum({ program }: ProgramCurriculumProps) {
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex gap-4 min-w-max">
        {program.semesters.map((semester) => (
          <div key={semester.number} className="border rounded-md p-4">
            <h4 className="font-semibold mb-3">Semestre {semester.number}</h4>

            <div className="grid gap-2">
              {semester.courseCodes.map((courseCode) => (
                <Link
                  className="rounded border bg-accent px-3 py-2 text-sm hover:bg-muted"
                  href={`/${courseCode}`}
                  key={courseCode}
                >
                  {courseCode}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
