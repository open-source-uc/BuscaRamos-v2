"use client";

import { Button } from "@/components/ui/button";
import useForm from "@/hooks/useForm";
import { CourseReview, NULL_STRING } from "@/types/types";
import {
  AttendanceIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  HappyIcon,
  HourglassIcon,
  PlusIcon,
  StarIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  WorkloadIcon,
} from "../icons";
import { useEffect, useMemo } from "react";
import { ButtonInput } from "../ui/button-input";
import { NumericInput } from "../ui/numeric-input";
import { SelectInput } from "../ui/select-input";
import { CURRENT_SEMESTER, getMaxAllowedYear } from "@/lib/currentSemester";
import Link from "next/link";
import TrashButton from "./TrashButton";
import { toast } from "sonner";
export default function FormReview({
  sigle,
  initialValues,
  onSubmit,
}: {
  sigle: string;
  initialValues: (CourseReview & { comment: string | null }) | undefined;
  onSubmit: (data: FormData) => Promise<{ message: string; success?: boolean }>;
}) {
  const [state, action, pending] = useForm(onSubmit, {
    message: NULL_STRING,
  });

  useEffect(() => {
    if (state.message === NULL_STRING) return;
    if (state.success === true) {
      toast.success(state.message);
      return;
    }
    toast.error(state.message);
  }, [state]);

  const isEditMode = useMemo(() => !!initialValues, [initialValues]);
  const currentYear = getMaxAllowedYear();

  return (
    <div className="mx-auto px-2 py-4 sm:px-4 sm:py-8">
      <div className="border-border rounded-md border p-3 sm:p-6">
        <h3 className="text-foreground mb-3 flex items-center gap-2 font-medium">
          <div className="bg-blue-light text-blue border-blue/20 rounded-lg border p-2 font-medium">
            <EditIcon className="h-4 w-4 fill-current" />
          </div>
          Consejos para una buena reseña
        </h3>
        <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="bg-muted-foreground mt-2 h-1 w-1 flex-shrink-0 rounded-full"></div>
              <span>Sé respetuoso con el equipo docente</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-muted-foreground mt-2 h-1 w-1 flex-shrink-0 rounded-full"></div>
              <span>Incluye información útil para futuros estudiantes del curso</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <div className="bg-muted-foreground mt-2 h-1 w-1 flex-shrink-0 rounded-full"></div>
              <span>Sé constructivo en tu reseña</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="bg-muted-foreground mt-2 h-1 w-1 flex-shrink-0 rounded-full"></div>
              <span>Considera incluir ejemplos concretos de tu experiencia</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="border-border mt-4 sm:mt-8 overflow-hidden rounded-md border">
        <div className="border-border border-b px-3 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div>
              <h2 className="text-foreground text-xl sm:text-2xl font-semibold">
                {isEditMode ? "Editar tu Reseña" : "Crear Reseña de Curso"}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Comparte tu experiencia con otros estudiantes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <span className="text-muted-foreground font-medium">
                  {isEditMode ? "Modo Edición" : "Nueva Reseña"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              action(new FormData(e.currentTarget));
            }}
            className="space-y-6 sm:space-y-8"
          >
            <input type="hidden" name="course_sigle" value={sigle} />

            <div className="border-border rounded-md border p-3 sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
                <div className="bg-green-light text-green border-green/20 rounded-lg border p-2">
                  <HappyIcon className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                </div>
                Valoración General
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                <ButtonInput
                  variant="red"
                  icon={ThumbDownIcon}
                  title="No lo recomiendo"
                  subtitle="El curso no cumplió expectativas"
                  inputProps={{
                    type: "radio",
                    name: "like_dislike",
                    value: "0",
                    defaultChecked: initialValues?.like_dislike === 0,
                    required: true,
                  }}
                />

                <ButtonInput
                  variant="blue"
                  icon={ThumbUpIcon}
                  title="Lo recomiendo"
                  subtitle="El curso cumplió mis expectativas"
                  inputProps={{
                    type: "radio",
                    name: "like_dislike",
                    value: "1",
                    defaultChecked: initialValues?.like_dislike === 1,
                    required: true,
                  }}
                />

                <ButtonInput
                  variant="green"
                  icon={StarIcon}
                  title="Lo super recomiendo"
                  subtitle="El curso excedió mis expectativas"
                  inputProps={{
                    type: "radio",
                    name: "like_dislike",
                    value: "2",
                    defaultChecked: initialValues?.like_dislike === 2,
                    required: true,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="border-border rounded-md border p-3 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
                  <div className="bg-blue-light text-blue border-blue/20 rounded-lg border p-2">
                    <WorkloadIcon className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  </div>
                  Nivel de Dificultad
                </h3>
                <div className="space-y-3">
                  <ButtonInput
                    variant="green"
                    size="sm"
                    icon={HourglassIcon}
                    title="Baja"
                    subtitle="Se lleva con tranquilidad"
                    inputProps={{
                      type: "radio",
                      name: "workload_vote",
                      value: "0",
                      defaultChecked: initialValues?.workload_vote === 0,
                      required: true,
                    }}
                  />

                  <ButtonInput
                    variant="orange"
                    size="sm"
                    icon={HourglassIcon}
                    title="Normal"
                    subtitle="Exige algo de compromiso"
                    inputProps={{
                      type: "radio",
                      name: "workload_vote",
                      value: "1",
                      defaultChecked: initialValues?.workload_vote === 1,
                      required: true,
                    }}
                  />

                  <ButtonInput
                    variant="red"
                    size="sm"
                    icon={HourglassIcon}
                    title="Alta"
                    subtitle="Puede sentirse intenso o pesado"
                    inputProps={{
                      type: "radio",
                      name: "workload_vote",
                      value: "2",
                      defaultChecked: initialValues?.workload_vote === 2,
                      required: true,
                    }}
                  />
                </div>
              </div>

              <div className="border-border rounded-md border p-3 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
                  <div className="bg-purple-light text-purple border-purple/20 rounded-lg border p-2">
                    <AttendanceIcon className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                  </div>
                  Tipo de Asistencia
                </h3>
                <div className="space-y-3">
                  <ButtonInput
                    variant="red"
                    size="sm"
                    icon={AttendanceIcon}
                    title="Obligatoria"
                    subtitle="Asistencia requerida"
                    inputProps={{
                      type: "radio",
                      name: "attendance_type",
                      value: "0",
                      defaultChecked: initialValues?.attendance_type === 0,
                      required: true,
                    }}
                  />

                  <ButtonInput
                    variant="green"
                    size="sm"
                    icon={AttendanceIcon}
                    title="Opcional"
                    subtitle="Puedes faltar sin problemas"
                    inputProps={{
                      type: "radio",
                      name: "attendance_type",
                      value: "1",
                      defaultChecked: initialValues?.attendance_type === 1,
                      required: true,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="border-border rounded-md border p-3 sm:p-6">
              <h3 className="mb-6 flex items-center gap-2 text-base sm:text-lg font-semibold">
                <div className="bg-green-light text-green border-green/20 rounded-lg border p-2">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                </div>
                Detalles del Curso
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                <NumericInput
                  icon={ClockIcon}
                  label="Horas Semanales"
                  description="Tiempo dedicado semanalmente al curso"
                  placeholder="8"
                  name="weekly_hours"
                  required={true}
                  min={0}
                  max={168}
                  defaultValue={initialValues?.weekly_hours || ""}
                />

                <NumericInput
                  icon={CalendarIcon}
                  label="Año Cursado"
                  description="Año en que cursaste la materia"
                  placeholder={currentYear.toString()}
                  name="year_taken"
                  required={true}
                  min={2000}
                  max={currentYear}
                  defaultValue={initialValues?.year_taken || ""}
                />

                <SelectInput
                  icon={CalendarIcon}
                  label="Semestre"
                  description={`Período académico cursado (máximo ${CURRENT_SEMESTER})`}
                  selectProps={{
                    id: "semester_taken",
                    name: "semester_taken",
                    required: true,
                  }}
                >
                  <option value="">Seleccionar semestre</option>
                  <option value="1" selected={initialValues?.semester_taken === 1}>
                    1° Semestre
                  </option>
                  <option value="2" selected={initialValues?.semester_taken === 2}>
                    2° Semestre
                  </option>
                  <option value="3" selected={initialValues?.semester_taken === 3}>
                    TAV (Temporada Académica de Verano)
                  </option>
                </SelectInput>
              </div>
            </div>

            <div className="border-border rounded-md border p-3 sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold">
                <div className="bg-purple-light text-purple border-purple/20 rounded-lg border p-2">
                  <EditIcon className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                </div>
                Comentario (Opcional)
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                ¿Cómo fue tu vivencia en el curso? Comenta sobre los tipos de evaluaciones, tu
                opinión sobre el curso (de forma respetuosa y con criterio), las estrategias de
                estudio que te resultaron útiles, qué fue lo más desafiante del ramo y qué fue lo
                que más disfrutaste.
              </p>
              <textarea
                id="comment"
                name="comment"
                rows={6}
                maxLength={10000}
                placeholder="Escribe tu comentario aquí... Puedes incluir información sobre la metodología, evaluaciones, consejos para el curso, etc."
                className="border-border focus:border-primary focus:ring-primary/20 focus:ring-opacity-50 resize-vertical field-sizing-content min-h-20 w-full resize-none rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:ring"
                defaultValue={initialValues?.comment || ""}
              />

              <div className="mt-2 flex justify-between">
                <p className="text-muted-foreground text-xs">Máximo 10,000 caracteres</p>
              </div>
            </div>

            <div className="border-border flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href={`/${sigle}/`} className="text-muted-foreground hover:text-foreground">
                  ← Volver al curso
                </Link>
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full sm:w-auto"
                  disabled={pending}
                >
                  {isEditMode ? <EditIcon /> : <PlusIcon />}
                  {isEditMode ? "Actualizar Reseña" : "Guardar Reseña"}
                </Button>

                {initialValues?.id && <TrashButton review={initialValues}></TrashButton>}
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
