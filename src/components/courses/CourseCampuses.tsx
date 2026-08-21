"use client";

import { Pill } from "@/components/ui/Pill";
import { LocationIcon } from "@/components/icons/Icons";
import { useCurrentSemester } from "@/context/semesterCtx";

interface CourseCampusesProps {
  campus: string[];
  lastSemester: string;
}

export default function CourseCampuses({ campus, lastSemester }: CourseCampusesProps) {
  const currentSemester = useCurrentSemester();
  if (!campus || campus.length === 0) {
    return null;
  }

  const prefixText =
    lastSemester === currentSemester ? "Actualmente ofrecido en" : "Previamente ofrecido en";

  const campusText = campus.join(", ");

  return (
    <>
      <Pill key={campusText} variant="blue" icon={LocationIcon}>
        <div className="flex flex-col">
          <span className="text-xs font-medium opacity-80">{prefixText}</span>
          <span>{campusText}</span>
        </div>
      </Pill>
    </>
  );
}
