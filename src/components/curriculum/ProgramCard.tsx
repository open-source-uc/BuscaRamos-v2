import type { Program } from "@/types/types";

interface ProgramCardProps {
  program: Program;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  return (
    <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <h3 className="font-semibold">{program.name}</h3>

      <p className="text-sm text-gray-600">
        {program.school} - {program.level} - {program.campus}
      </p>

      <p className="text-sm text-gray-500">{program.semesters.length} semestres</p>
    </div>
  );
}
