import { Pill } from "@/components/ui/pill";
import { DocsIcon, TextureIcon, OpenInFullIcon } from "@/components/icons/icons";

interface OpensCoursesDisplayProps {
  unlocks: {
    as_prerequisite: Array<{ sigle: string; name?: string }>;
    as_corequisite: Array<{ sigle: string; name?: string }>;
  };
  className?: string;
}

export const OpensCoursesDisplay = ({ unlocks, className = "" }: OpensCoursesDisplayProps) => {
  if (unlocks === undefined || Object.keys(unlocks).length === 0) {
    return (
      <div className={`w-full py-6 ${className}`}>
        <div className="text-muted-foreground flex items-center gap-3">
          <div className="bg-green-light text-green border-green/20 flex-shrink-0 rounded-lg border p-2">
            <DocsIcon className="h-5 w-5 fill-current" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Este curso no desbloquea otros ramos directos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden py-6 ${className}`}>
      <div className="w-full space-y-1">
        {unlocks.as_prerequisite.map((course, index) => (
          <a
            key={`${course.sigle}-${index}`}
            href={`/${course.sigle}`}
            className="hover:bg-muted/50 group flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-200"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Pill
                icon={TextureIcon}
                variant="green"
                size="xs"
                className="flex-shrink-0"
              >
                {course.sigle}
              </Pill>

              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium text-wrap" title={course.name || course.sigle}>
                  {course.name || course.sigle}
                </p>
              </div>
            </div>

            <OpenInFullIcon className="text-muted-foreground group-hover:text-foreground h-4 w-4 flex-shrink-0 transition-colors duration-200" />
          </a>
        ))}
        {unlocks.as_corequisite.map((course, index) => (
          <a
            key={`${course.sigle}-${index}`}
            href={`/${course.sigle}`}
            className="hover:bg-muted/50 group flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-200"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Pill
                icon={TextureIcon}
                variant="orange"
                size="xs"
                className="flex-shrink-0"
              >
                {course.sigle}
              </Pill>

              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium text-wrap" title={course.name || course.sigle}>
                  {course.name || course.sigle}
                </p>
              </div>
            </div>

            <OpenInFullIcon className="text-muted-foreground group-hover:text-foreground h-4 w-4 flex-shrink-0 transition-colors duration-200" />
          </a>
        ))}
      </div>
    </div>
  );
};