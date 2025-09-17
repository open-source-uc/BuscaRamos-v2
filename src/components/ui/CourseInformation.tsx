import { CourseStaticData } from "@/lib/coursesStaticData";
import CourseCampuses from "../courses/CourseCampuses";
import {
  AreaIcon,
  BuildingIcon,
  CheckIcon,
  CloseIcon,
  HourglassIcon,
  LanguageIcon,
} from "../icons";
import { Pill } from "./pill";
import Link from "next/link";

export default function CourseInformation({
  course,
  description,
  information = false,
}: {
  course: CourseStaticData;
  description?: string;
  information?: boolean;
}) {
  return (
    <section className="border border-border rounded-md bg-accent px-6 py-8">
      <Link href={`/${course.sigle}`}>
        <p className="text-sm underline">{course.sigle}</p>
      </Link>

      <div className="pt-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2 max-w-[75%]">{course.name}</h1>
        <Pill
          variant="green"
          size="xl"
          icon={HourglassIcon}
          className="hidden desktop:flex text-nowrap"
        >
          {course.credits} Créditos
        </Pill>
      </div>
      {description && (
        <div>
          <p className="text-sm text-accent-foreground max-w-[75%]">{description}</p>
        </div>
      )}
      {information && (
        <div className={`flex items-center flex-wrap gap-2 ${description ? "mt-4" : ""}`}>
          <CourseCampuses campus={course.campus} lastSemester={course.last_semester} />
          <Pill variant="green" icon={HourglassIcon} className="desktop:hidden">
            {course.credits} Créditos
          </Pill>
          {course.school && course.school !== "" && (
            <Pill variant="orange" icon={BuildingIcon}>
              <span>{course.school}</span>
            </Pill>
          )}
          {course.area && course.area !== "" && (
            <Pill variant="pink" icon={AreaIcon}>
              {course.area}
            </Pill>
          )}
          {course.is_removable && course.is_removable.length > 0 && (
            <Pill
              variant={course.is_removable.some((removable) => removable) ? "green" : "red"}
              icon={course.is_removable.some((removable) => removable) ? CheckIcon : CloseIcon}
            >
              {course.is_removable.some((removable) => removable) ? "Retirable" : "No retirable"}
            </Pill>
          )}
          {course.is_english &&
            course.is_english.length > 0 &&
            course.is_english.some((english) => english) && (
              <Pill variant="purple" icon={LanguageIcon}>
                Se dicta en Inglés
              </Pill>
            )}
        </div>
      )}
    </section>
  );
}
