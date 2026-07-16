import { customCodeParser } from "@/lib/programs";
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
            <h4 className="font-semibold text-sm text-center mb-3">Semestre {semester.number}</h4>

            <div className="grid gap-2">
              {semester.courses.map((course, index) => {
                const courseCode = semester.courseCodes[index];

                if (!course?.sigle)
                  return (
                    <p
                      key={`${courseCode}-${index}`}
                      className="rounded border bg-accent font-semibold leading-tight text-center px-3 py-5 text-xs hover:bg-muted"
                    >
                      {customCodeParser(courseCode)}
                    </p>
                  );

                return (
                  <Link
                    key={course.sigle}
                    href={`/${course.sigle}`}
                    className="rounded-md border bg-accent px-3 py-2 text-xs hover:bg-muted transition-colors min-w-35"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold leading-tight text-center">{course.name}</span>

                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <span>{course.sigle}</span>
                        <span>{course.credits} cr</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
