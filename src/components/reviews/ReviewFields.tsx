import { FormSection, FormFieldGroup, FormRow } from "@/components/ui/form-composition";
import { ButtonInput } from "@/components/ui/button-input";
import { 
  ThumbDownIcon, 
  ThumbUpIcon, 
  StarIcon,
  WorkloadIcon,
  AttendanceIcon 
} from "@/components/icons";
import { CourseReview } from "@/types/types";

interface ReviewFieldsProps {
  initialValues?: (CourseReview & { comment: string | null }) | undefined;
}

export function ReviewFields({ initialValues }: ReviewFieldsProps) {
  return (
    <>
      {/* Rating Section */}
      <FormSection
        title="Calificación General"
        description="¿Cómo calificarías tu experiencia general en este curso?"
        icon={StarIcon}
        iconVariant="purple"
      >
        <FormRow columns={3} gap="sm">
          <ButtonInput
            variant="red"
            size="sm"
            icon={ThumbDownIcon}
            title="No me gustó"
            subtitle="Experiencia negativa"
            inputProps={{
              type: "radio",
              name: "like_dislike",
              value: "0",
              defaultChecked: initialValues?.like_dislike === 0,
              required: true,
            }}
          />
          <ButtonInput
            variant="green"
            size="sm"
            icon={ThumbUpIcon}
            title="Me gustó"
            subtitle="Experiencia positiva"
            inputProps={{
              type: "radio",
              name: "like_dislike",
              value: "1",
              defaultChecked: initialValues?.like_dislike === 1,
              required: true,
            }}
          />
          <ButtonInput
            variant="yellow"
            size="sm"
            icon={StarIcon}
            title="Me encantó"
            subtitle="Experiencia excelente"
            inputProps={{
              type: "radio",
              name: "like_dislike",
              value: "2",
              defaultChecked: initialValues?.like_dislike === 2,
              required: true,
            }}
          />
        </FormRow>
      </FormSection>

      {/* Workload Section */}
      <FormSection
        title="Carga de Trabajo"
        description="¿Cuánto tiempo semanal dedicaste a este curso?"
        icon={WorkloadIcon}
        iconVariant="green"
      >
        <FormRow columns={3} gap="sm">
          <ButtonInput
            variant="green"
            size="sm"
            icon={WorkloadIcon}
            title="Baja"
            subtitle="Menos de 6 horas/semana"
            inputProps={{
              type: "radio",
              name: "workload_vote",
              value: "0",
              defaultChecked: initialValues?.workload_vote === 0,
              required: true,
            }}
          />
          <ButtonInput
            variant="yellow"
            size="sm"
            icon={WorkloadIcon}
            title="Media"
            subtitle="6-12 horas/semana"
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
            icon={WorkloadIcon}
            title="Alta"
            subtitle="Más de 12 horas/semana"
            inputProps={{
              type: "radio",
              name: "workload_vote",
              value: "2",
              defaultChecked: initialValues?.workload_vote === 2,
              required: true,
            }}
          />
        </FormRow>
      </FormSection>

      {/* Attendance Section */}
      <FormSection
        title="Asistencia"
        description="¿Cómo fue el control de asistencia en este curso?"
        icon={AttendanceIcon}
        iconVariant="yellow"
      >
        <FormRow columns={2} gap="md">
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
        </FormRow>
      </FormSection>
    </>
  );
}