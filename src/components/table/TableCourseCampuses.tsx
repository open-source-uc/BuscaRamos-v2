import { Pill } from "@/components/ui/pill";
import { getCampusPrefix, isCurrentSemester } from "@/lib/currentSemester";
import { LocationIcon } from "@/components/icons/icons";

interface TableCourseCampusesProps {
  campus: string[];
  lastSemester: string;
  variant?: "default" | "with-icon";
}

export default function TableCourseCampuses({
  campus,
  lastSemester,
  variant = "default",
}: TableCourseCampusesProps) {
  // Filter out empty strings and null/undefined values
  const validCampus = campus?.filter((campusItem) => campusItem && campusItem.trim() !== "") || [];

  if (validCampus.length === 0) {
    return <div></div>;
  }

  const prefixText = getCampusPrefix(lastSemester);
  const pillVariant = isCurrentSemester(lastSemester) ? "blue" : "red";

  return (
    <div className="w-full desktop:w-auto">
      <Pill variant={pillVariant} size="md" className="inline-block">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium opacity-80 whitespace-nowrap">{prefixText}</span>
          <div className="flex flex-wrap items-center gap-1 min-w-0">
            {variant === "with-icon" && <LocationIcon className="h-4 w-4 flex-shrink-0" />}
            <span className="break-words text-sm whitespace-normal">{validCampus.join(", ")}</span>
          </div>
        </div>
      </Pill>
    </div>
  );
}
