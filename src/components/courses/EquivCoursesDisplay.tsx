import { Pill } from "@/components/ui/pill";
import { DocsIcon, OpenInFullIcon, DeceasedIcon } from "@/components/icons/icons";
import { EquivalentCourse, EquivalentGroup } from "@/lib/courseEquiv";

interface EquivalentsDisplayProps {
  equivalents: EquivalentGroup;
  className?: string;
}

export const EquivCoursesDisplay = ({ equivalents, className = "" }: EquivalentsDisplayProps) => {
  const hasEquivalents =
    (equivalents?.courses?.length ?? 0) > 0 || (equivalents?.groups?.length ?? 0) > 0;

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
      <EquivalentGroupComponent group={equivalents} />
    </div>
  );
};

interface EquivalentGroupComponentProps {
  group: EquivalentGroup;
  isNested?: boolean;
}

const EquivalentGroupComponent = ({ group, isNested = false }: EquivalentGroupComponentProps) => {
  // Texto descriptivo según el tipo del grupo
  const groupLabel =
    group.type === "AND"
      ? "Todos estos cursos son equivalentes entre sí"
      : "Cualquiera de estos cursos es equivalente";

  // Renderiza un curso individual
  const renderCourse = (course: EquivalentCourse, index: number) => {
    const hasName = course.name && course.name.trim() !== "";

    if (!hasName) {
      return (
        <div key={`${course.sigle}-${index}`} className="flex w-full items-center gap-3 px-3 py-2">
          <Pill
            icon={DeceasedIcon}
            variant="ghost_blue"
            size="xs"
            className="flex-shrink-0 w-20 justify-center"
          >
            {course.sigle}
          </Pill>
        </div>
      );
    }

    return (
      <a
        key={`${course.sigle}-${index}`}
        href={`/${course.sigle}`}
        className="hover:bg-muted/50 group flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-200"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Pill variant="blue" size="xs" className="flex-shrink-0 w-20 justify-center">
            {course.sigle}
          </Pill>

          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm font-medium text-wrap" title={course.name}>
              {course.name}
            </p>
          </div>
        </div>

        <OpenInFullIcon className="text-muted-foreground group-hover:text-foreground h-4 w-4 flex-shrink-0 transition-colors duration-200" />
      </a>
    );
  };

  // Renderiza un subgrupo anidado
  const renderGroup = (subGroup: EquivalentGroup, index: number) => (
    <div
      key={`group-${index}`}
      className="border-border bg-muted/30 my-2 w-full overflow-hidden rounded-lg border px-2 py-4"
    >
      <EquivalentGroupComponent group={subGroup} isNested={true} />
    </div>
  );

  const courses = group.courses || [];
  const groups = group.groups || [];
  const allItems = [...courses, ...groups];

  // Renderiza el separador visual (Y / O)
  const renderSeparatorPill = (separatorType: "AND" | "OR") => {
    const separatorText = separatorType === "AND" ? "Y" : "O";

    return (
      <div className="flex justify-center py-2">
        <div
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            separatorType === "AND"
              ? "bg-blue-light text-blue border-blue/20"
              : "bg-green-light text-green border-green/20"
          }`}
        >
          {separatorText}
        </div>
      </div>
    );
  };

  const hasMultipleItems = allItems.length > 1;

  return (
    <div className={`w-full overflow-hidden ${isNested ? "space-y-2" : "space-y-3"}`}>
      {/* Header de grupo anidado */}
      {isNested && hasMultipleItems && (
        <div className="border-border flex w-full items-center gap-3 border-b px-2 pb-3">
          <div
            className={`h-2 w-2 flex-shrink-0 rounded-full ${
              group.type === "AND" ? "bg-primary" : "bg-green"
            }`}
          ></div>
          <span className="text-muted-foreground min-w-0 flex-1 text-sm font-semibold">
            {groupLabel}
          </span>
        </div>
      )}

      {/* Renderiza cursos y grupos */}
      <div className="w-full space-y-1">
        {allItems.map((item, index) => {
          const isGroup = "type" in item;
          const isLast = index === allItems.length - 1;

          return (
            <div key={`item-${index}`} className="w-full">
              {isGroup
                ? renderGroup(item as EquivalentGroup, index)
                : renderCourse(item as EquivalentCourse, index)}
              {!isNested && !isLast && renderSeparatorPill(group.type)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
