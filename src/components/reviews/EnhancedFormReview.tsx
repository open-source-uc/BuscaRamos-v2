"use client";

import { FormSection, FormFieldGroup, FormRow } from "@/components/ui/form-composition";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useFormValidation } from "@/hooks/useFormValidation";
import { CourseReview } from "@/types/types";
import { EditIcon, StarIcon } from "@/components/icons";
import { ReviewFields } from "./ReviewFields";
import { useScreenReaderAnnouncement, useAccessibleId } from "@/lib/accessibility";
import { usePerformanceMonitor } from "@/hooks/usePerformance";

interface EnhancedFormReviewProps {
  sigle: string;
  initialValues?: (CourseReview & { comment: string | null }) | undefined;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Refactored FormReview component demonstrating:
 * - Composition patterns with FormSection and FormRow
 * - Error boundaries for better error handling
 * - Accessibility improvements
 * - Performance monitoring
 * - TypeScript improvements
 * - Custom hooks for form management
 */
export default function EnhancedFormReview({
  sigle,
  initialValues,
  onSubmit,
  onCancel,
}: EnhancedFormReviewProps) {
  // Performance monitoring
  usePerformanceMonitor('EnhancedFormReview');

  // Accessibility
  const { announce, AnnouncementRegion } = useScreenReaderAnnouncement();
  const formId = useAccessibleId('review-form');

  // Form validation with custom hook
  const {
    values,
    isSubmitting,
    hasErrors,
    isDirty,
    getFieldProps,
    handleSubmit,
    reset,
  } = useFormValidation(
    {
      like_dislike: initialValues?.like_dislike ?? '',
      workload_vote: initialValues?.workload_vote ?? '',
      attendance_type: initialValues?.attendance_type ?? '',
      weekly_hours: initialValues?.weekly_hours ?? 0,
      year_taken: initialValues?.year_taken ?? new Date().getFullYear(),
      semester_taken: initialValues?.semester_taken ?? '',
      comment: initialValues?.comment ?? '',
    },
    {
      validation: {
        like_dislike: { required: true },
        workload_vote: { required: true },
        attendance_type: { required: true },
        weekly_hours: { required: true, min: 0, max: 50 },
        year_taken: { required: true, min: 2020, max: new Date().getFullYear() },
        semester_taken: { required: true },
      },
      onSuccess: (data) => {
        announce('Reseña enviada exitosamente');
      },
      onError: (error) => {
        announce(`Error al enviar reseña: ${error}`);
      },
    }
  );

  const handleFormSubmit = async (formValues: Record<string, any>) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const isEditMode = !!initialValues;

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-4xl px-2 py-4 sm:px-4 sm:py-8">
        <AnnouncementRegion />
        
        {/* Guidelines Section */}
        <FormSection
          title="Consejos para una buena reseña"
          icon={EditIcon}
          iconVariant="purple"
          className="mb-6"
        >
          <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-2">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                <span>Sé respetuoso con el equipo docente</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                <span>Incluye información útil para futuros estudiantes</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                <span>Sé constructivo en tu reseña</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                <span>Considera incluir ejemplos concretos</span>
              </li>
            </ul>
          </div>
        </FormSection>

        {/* Main Form */}
        <section className="overflow-hidden rounded-md border border-border">
          <div className="border-b border-border px-3 py-4 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                  {isEditMode ? "Editar tu Reseña" : "Crear Reseña de Curso"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comparte tu experiencia con otros estudiantes del curso {sigle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    {isEditMode ? "Modo Edición" : "Nueva Reseña"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <form
            id={formId}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(handleFormSubmit);
            }}
            className="space-y-6 p-3 sm:p-6"
            noValidate
          >
            {/* Review Fields using composition */}
            <ReviewFields initialValues={initialValues} />

            {/* Additional fields can be added here using the same composition pattern */}

            {/* Form Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t border-border sm:flex-row sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isDirty && <span>• Tienes cambios sin guardar</span>}
                {hasErrors && <span className="text-destructive">• Revisa los errores</span>}
              </div>
              
              <div className="flex gap-3">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                )}
                
                <IconButton
                  type="submit"
                  icon={StarIcon}
                  loading={isSubmitting}
                  loadingText="Enviando..."
                  disabled={hasErrors}
                  className="min-w-[120px]"
                >
                  {isEditMode ? "Actualizar" : "Publicar"} Reseña
                </IconButton>
              </div>
            </div>
          </form>
        </section>
      </div>
    </ErrorBoundary>
  );
}