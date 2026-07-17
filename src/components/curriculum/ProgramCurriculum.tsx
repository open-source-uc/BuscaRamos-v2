import { useNDJSONStream } from "@/hooks/useNDJSONStream";
import { getWorkloadLabel } from "@/lib/courseStats";
import { customCodeParser } from "@/lib/programs";
import { cn } from "@/lib/utils";
import type { CourseScore, Program } from "@/types/types";
import Link from "next/link";

interface ProgramCurriculumProps {
  program: Program;
}

export default function ProgramCurriculum({ program }: ProgramCurriculumProps) {
  const { data: courseScoreData } = useNDJSONStream<CourseScore>(
    "https://public.osuc.dev/courses-score.ndjson"
  );

  const courseScoreMap = new Map(courseScoreData.map((course) => [course.sigle, course]));

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium">Dificultad:</span>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-light border border-green/20" />
          <span>Baja</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-orange-light border border-orange/20" />
          <span>Media</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-light border border-red/20" />
          <span>Alta</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border bg-accent" />
          <span>Sin datos</span>
        </div>
      </div>

      <div className="flex gap-4 min-w-max">
        {program.semesters.map((semester) => (
          <div key={semester.number} className="border rounded-md p-4">
            <h4 className="font-semibold text-sm text-center mb-3">Semestre {semester.number}</h4>

            <div className="grid gap-2">
              {semester.courses.map((course, index) => {
                const courseCode = semester.courseCodes[index];
                const stats = courseScoreMap.get(courseCode);
                const workloadLabel = stats
                  ? getWorkloadLabel(
                      stats.votes_low_workload,
                      stats.votes_medium_workload,
                      stats.votes_high_workload
                    )
                  : "Sin datos";

                const workloadColors: Record<string, string> = {
                  "Sin datos": "",
                  Baja: "bg-green-light text-green border border-green/20 hover:bg-green/60",
                  Media: "bg-orange-light text-orange border border-orange/20 hover:bg-orange/60",
                  Alta: "bg-red-light text-red border border-red/20 hover:bg-red/60",
                };

                const color = workloadColors[workloadLabel];

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
                    target="_blank"
                    className={cn(
                      "rounded-md border bg-accent px-3 py-2 text-xs hover:bg-muted transition-colors min-w-35",
                      color
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold leading-tight text-center">{course.name}</span>

                      <div className="flex justify-between items-center text-muted-foreground text-xs mt-2">
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
