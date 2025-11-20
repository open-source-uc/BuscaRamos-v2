import { CourseStaticData } from "@/lib/coursesStaticData";
import CourseCampuses from "../courses/CourseCampuses";
import {
  AreaIcon,
  BuildingIcon,
  CheckIcon,
  CloseIcon,
  HourglassIcon,
  LanguageIcon,
  CategoryIcon,
  SwapIcon,
  StarIcon,
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
          {course.credits}
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

          {Array.isArray(course.categories) && course.categories.some((c) => c.trim() !== "") && (
            <Pill variant="purple" icon={CategoryIcon}>
              <span>{course.categories.filter((c) => c.trim() !== "").join(", ")}</span>
            </Pill>
          )}

          {Array.isArray(course.format) && course.format.some((f) => f.trim() !== "") && (
            <Pill variant="yellow" icon={SwapIcon}>
              <span>{course.format.filter((f) => f.trim() !== "").join(", ")}</span>
            </Pill>
          )}

          {Array.isArray(course.area) && course.area.length > 0 && (
            <Pill variant="pink" icon={AreaIcon}>
              <span>{course.area.filter((a) => a && String(a).trim() !== "").join(", ")}</span>
            </Pill>
          )}
          {Array.isArray(course.is_removable) &&
            course.is_removable.length > 0 &&
            (() => {
              const allTrue = course.is_removable.every((val) => val === true);
              const allFalse = course.is_removable.every((val) => val === false);
              const hasMixed = !allTrue && !allFalse;

              if (hasMixed) {
                return (
                  <Pill variant="orange" icon={CloseIcon}>
                    Hay secciones no retirables
                  </Pill>
                );
              }
              return (
                <Pill variant={allTrue ? "green" : "red"} icon={allTrue ? CheckIcon : CloseIcon}>
                  {allTrue ? "Retirable" : "No retirable"}
                </Pill>
              );
            })()}
          {Array.isArray(course.is_english) &&
            course.is_english.length > 0 &&
            (() => {
              const allTrue = course.is_english.every((val) => val === true);
              const allFalse = course.is_english.every((val) => val === false);
              const hasMixed = !allTrue && !allFalse;

              if (allTrue) {
                return (
                  <Pill variant="purple" icon={LanguageIcon}>
                    Se dicta en Inglés
                  </Pill>
                );
              } else if (hasMixed) {
                return (
                  <Pill variant="orange" icon={LanguageIcon}>
                    Hay secciones en inglés
                  </Pill>
                );
              }
              return null;
            })()}
          {Array.isArray(course.is_special) &&
            course.is_special.length > 0 &&
            (() => {
              const allTrue = course.is_special.every((val) => val === true);
              const allFalse = course.is_special.every((val) => val === false);
              const hasMixed = !allTrue && !allFalse;

              if (allTrue) {
                return (
                  <Pill variant="yellow" icon={StarIcon}>
                    Especial
                  </Pill>
                );
              } else if (hasMixed) {
                return (
                  <Pill variant="orange" icon={StarIcon}>
                    Hay secciones especiales
                  </Pill>
                );
              }
              return null;
            })()}
        </div>
      )}
    </section>
  );
}
