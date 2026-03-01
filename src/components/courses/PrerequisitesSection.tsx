import { DocsIcon, ChevronDownIcon, TextureIcon, DeceasedIcon } from "@/components/icons/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ParsedPrerequisites } from "@/lib/courseReq";
import { ParsedRestrictions } from "@/lib/courseRestrictions";
import { PrerequisitesDisplay } from "./PrerequisitesDisplay";
import { RestrictionsDisplay } from "./RestrictionsDisplay";

interface Props {
  prerequisites: ParsedPrerequisites;
  restrictions?: ParsedRestrictions;
  connector?: string; // "AND" | "OR" o "y" | "o"
  className?: string;
}

export default function PrerequisitesSection({
  prerequisites,
  restrictions,
  connector,
  className = "",
}: Props) {
  const hasPrerequisites = prerequisites.hasPrerequisites && prerequisites.structure;
  const hasRestrictions = restrictions?.hasRestrictions && restrictions?.structure;
  const hasAny = hasPrerequisites || hasRestrictions;

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
    if (!connector || !hasPrerequisites || !hasRestrictions) return null;

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
            <div className="w-full overflow-hidden space-y-4">
              {hasPrerequisites && (
                <div>
                  <h3 className="text-foreground mb-3 text-sm font-semibold">Prerrequisitos</h3>
                  <PrerequisitesDisplay prerequisites={prerequisites.structure!} />
                </div>
              )}

              {hasRestrictions && (
                <>
                  {renderConnector()}
                  <RestrictionsDisplay restrictions={restrictions.structure!} />
                </>
              )}
            </div>

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
