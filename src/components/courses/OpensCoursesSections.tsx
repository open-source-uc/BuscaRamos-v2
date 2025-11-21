import { ChevronDownIcon, OpenInFullIcon, TextureIcon } from "@/components/icons/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { OpensCoursesDisplay } from "@/components/courses/OpensCoursesDisplay";

interface Props {
  unlocks: {
    as_prerequisite: Array<{ sigle: string; name?: string }>;
    as_corequisite: Array<{ sigle: string; name?: string }>;
  };
  className?: string;
}

export default function OpensCoursesSection({ unlocks, className = "" }: Props) {
  if (unlocks.as_prerequisite.length === 0 && unlocks.as_corequisite.length === 0) {
    return (
      <section className={`w-full ${className}`}>
        <div className="border-border bg-accent w-full overflow-hidden rounded-md border p-6">
          <div className="text-muted-foreground flex items-center gap-3">
            <div className="bg-green-light text-green border-green/20 flex-shrink-0 rounded-lg border p-2">
              <OpenInFullIcon className="h-5 w-5 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Qué ramos abre</h2>
              <p className="text-sm">Este curso no es prerrequisito directo de otros ramos</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`}>
      <div className="border-border w-full overflow-hidden rounded-md border">
        <Collapsible>
          <CollapsibleTrigger className="bg-accent hover:bg-muted/50 group focus:ring-primary flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="bg-green-light text-green border-green/20 flex-shrink-0 rounded-lg border p-2">
                <OpenInFullIcon className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-foreground text-lg font-semibold">Qué ramos abre</h2>
                <p className="text-muted-foreground text-sm">
                  Cursos que dependen de este ramo como prerrequisito o co-requisito
                </p>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center gap-2">
              <span className="text-muted-foreground tablet:inline hidden text-sm">Expandir</span>
              <ChevronDownIcon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="border-border bg-accent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1 w-full overflow-hidden border-t px-6 py-4">
            <div className="w-full overflow-hidden">
              <OpensCoursesDisplay unlocks={unlocks} />
            </div>
            <div className="border-border mt-4 w-full border-t pt-4">
              <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="bg-green border-green-light h-4 w-4 flex-shrink-0 rounded border"></div>
                  <span>Prerrequisitos ({unlocks.as_prerequisite.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-orange border-orange-light flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border">
                    <TextureIcon className="text-background h-3 w-3" />
                  </div>
                  <span>Co-requisitos ({unlocks.as_corequisite.length}) - Se pueden inscribir si se toma este ramo al mismo tiempo</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}