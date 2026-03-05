import { DocsIcon, ChevronDownIcon, TextureIcon, DeceasedIcon } from "@/components/icons/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CourseStaticData } from "@/lib/coursesStaticData";
import { PrerequisitesDisplay } from "./PrerequisitesDisplay";
import { RestrictionsDisplay } from "./RestrictionsDisplay";
import { Skeleton } from "@/components/ui/skeleton";

type ApiPrerequisiteGroup = NonNullable<CourseStaticData["parsed_meta_data"]["prerequisites"]>;
type ApiRestrictionGroup = NonNullable<CourseStaticData["parsed_meta_data"]["restrictions"]>;

interface Props {
  prerequisites?: CourseStaticData["parsed_meta_data"]["prerequisites"];
  hasPrerequisites: boolean;
  restrictions?: CourseStaticData["parsed_meta_data"]["restrictions"];
  hasRestrictions: boolean;
  connector?: string; // "AND" | "OR" o "y" | "o"
  className?: string;
  loading?: boolean;
}

function countCourses(group: ApiPrerequisiteGroup): number {
  const direct = group.courses?.length ?? 0;
  const nested = group.groups?.reduce((acc, g) => acc + countCourses(g), 0) ?? 0;
  return direct + nested;
}

export default function PrerequisitesSection({
  prerequisites,
  hasPrerequisites,
  restrictions,
  hasRestrictions,
  connector,
  className = "",
  loading = false,
}: Props) {
  const prerequisiteStructure = hasPrerequisites ? prerequisites : undefined;
  const restrictionStructure = hasRestrictions ? restrictions : undefined;
  const hasAny = Boolean(prerequisiteStructure || restrictionStructure);

  if (!hasAny) {
    return (
      <section className={`prerequisites-section w-full ${className}`}>
        <div className="border-border bg-accent w-full overflow-hidden rounded-md border p-6">
          <div className="text-muted-foreground flex items-center gap-3">
            <div className="bg-muted text-muted-foreground border-muted-foreground/20 flex-shrink-0 rounded-lg border p-2">
              <DocsIcon className="h-5 w-5 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Prerrequisitos y Restricciones</h2>
              <p className="text-sm">Este curso no posee prerrequisitos ni restricciones</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const renderConnector = () => {
    if (!connector || !prerequisiteStructure || !restrictionStructure) return null;

    // Normalizar el conector (puede venir como "y", "o", "AND", "OR")
    const normalizedConnector = connector.toUpperCase();
    const isAnd = normalizedConnector === "AND" || normalizedConnector === "Y";

    const connectorText = isAnd
      ? "Además debes cumplir con estas restricciones"
      : "Alternativamente, puedes tomar este curso SI cumples con";

    return (
      <div className="border-border my-4 flex items-center gap-3 border-t border-b py-4">
        <div
          className={`h-2 w-2 flex-shrink-0 rounded-full ${isAnd ? "bg-blue" : "bg-green"}`}
        ></div>
        <p className="text-foreground text-sm font-medium">{connectorText}</p>
      </div>
    );
  };

  return (
    <section className={`prerequisites-section w-full ${className}`}>
      <div className="border-border w-full overflow-hidden rounded-md border">
        <Collapsible>
          <CollapsibleTrigger className="bg-accent hover:bg-muted/50 group focus:ring-primary flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="bg-pink-light text-pink border-purple/20 flex-shrink-0 rounded-lg border p-2">
                <DocsIcon className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-foreground text-lg font-semibold">
                  Prerrequisitos{hasRestrictions ? " y Restricciones" : ""}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Conoce los cursos que necesitas para tomar este ramo
                  {hasRestrictions ? " y las restricciones aplicables" : ""}
                </p>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center gap-2">
              <span className="text-muted-foreground tablet:inline hidden text-sm">Expandir</span>
              <ChevronDownIcon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="border-border bg-accent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1 w-full overflow-hidden border-t px-6 py-4">
            {loading ? (
              <div className="space-y-2 py-6">
                {Array.from({
                  length: Math.max(
                    (prerequisiteStructure ? countCourses(prerequisiteStructure) : 0) +
                      (restrictionStructure ? 1 : 0),
                    1
                  ),
                }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : (
              <div className="w-full overflow-hidden space-y-4">
                {prerequisiteStructure && (
                  <div>
                    <h3 className="text-foreground mb-3 text-sm font-semibold">Prerrequisitos</h3>
                    <PrerequisitesDisplay prerequisites={prerequisiteStructure} />
                  </div>
                )}

                {restrictionStructure && (
                  <>
                    {renderConnector()}
                    <RestrictionsDisplay
                      restrictions={restrictionStructure as ApiRestrictionGroup}
                    />
                  </>
                )}
              </div>
            )}

            <div className="border-border mt-4 w-full border-t pt-4">
              <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="bg-blue border-blue-light h-4 w-4 flex-shrink-0 rounded border"></div>
                  <span>Prerrequisito regular</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-orange border-orange-light flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border">
                    <TextureIcon className="text-background h-3 w-3" />
                  </div>
                  <span>Co-requisito (puedes inscribir el curso al mismo tiempo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-muted-foreground border-muted flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border">
                    <DeceasedIcon className="text-muted h-3 w-3" />
                  </div>
                  <span>Curso no ofrecido desde el primer semestre de 2024</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
