import { Pill } from "@/components/ui/pill";
import { DocsIcon, OpenInFullIcon, DeceasedIcon } from "@/components/icons/icons";
import { useCourseNameMap } from "@/context/courseNameMapCtx";

interface EquivalentsDisplayProps {
  equivalences: string[];
  className?: string;
}

export const EquivCoursesDisplay = ({ equivalences, className = "" }: EquivalentsDisplayProps) => {
  const { courseNameMap } = useCourseNameMap();
  const hasEquivalents = equivalences.length > 0;

  if (!hasEquivalents) {
    return (
      <div className={`w-full py-6 ${className}`}>
        <div className="text-muted-foreground flex items-center gap-3">
          <div className="bg-green-light text-green border-green/20 flex-shrink-0 rounded-lg border p-2">
            <DocsIcon className="h-5 w-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Este curso no tiene cursos equivalentes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden py-6 ${className}`}>
      <div className="w-full space-y-1">
        {equivalences.map((sigle, index) => {
          const courseName = courseNameMap[sigle.toUpperCase()] || "";
          const hasName = courseName.trim() !== "";

          if (!hasName) {
            return (
              <div key={`${sigle}-${index}`} className="flex w-full items-center gap-3 px-3 py-2">
                <Pill
                  icon={DeceasedIcon}
                  variant="ghost_blue"
                  size="xs"
                  className="flex-shrink-0 w-20 justify-center"
                >
                  {sigle}
                </Pill>
              </div>
            );
          }

          return (
            <a
              key={`${sigle}-${index}`}
              href={`/${sigle}`}
              className="hover:bg-muted/50 group flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-200"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Pill variant="blue" size="xs" className="flex-shrink-0 w-20 justify-center">
                  {sigle}
                </Pill>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium text-wrap" title={courseName}>
                    {courseName}
                  </p>
                </div>
              </div>

              <OpenInFullIcon className="text-muted-foreground group-hover:text-foreground h-4 w-4 flex-shrink-0 transition-colors duration-200" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
