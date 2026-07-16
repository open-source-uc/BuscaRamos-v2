import { useState } from "react";
import type { Program } from "@/types/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/icons";
import ProgramCurriculum from "./ProgramCurriculum";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border p-4">
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{program.name}</h3>

              <p className="text-sm text-gray-600">
                {program.school} - {program.level} - {program.campus}
              </p>

              <p className="text-sm text-gray-500">{program.semesters.length} semestres</p>
            </div>

            {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ProgramCurriculum program={program} />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
