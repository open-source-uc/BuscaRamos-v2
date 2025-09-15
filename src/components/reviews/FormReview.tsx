"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createCourseReview } from '@/actions/user.reviews';
import useForm from '@/hooks/useForm';
import { CourseReview } from '@/types/types';
export default function FormReview({ 
  sigle, 
  initialValues 
}: {
  sigle: string;
  initialValues: CourseReview & { comment: string | null } | undefined;
}) {

    const [state, action, pending] = useForm(createCourseReview, {
        message: "Nada enviado aun",
    });    

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Reseña del Curso</CardTitle>
        <CardDescription>Informacion: {state?.message}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            action(new FormData(e.currentTarget));
        }}>
          {/* Hidden field for course sigle */}
          <input type="hidden" name="course_sigle" value={sigle} />

          {/* Valoración General */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Valoración general</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="like_dislike" 
                  value="0" 
                  id="rating-0" 
                  defaultChecked={initialValues?.like_dislike === 0}
                />
                <Label htmlFor="rating-0" className="cursor-pointer">No lo recomiendo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="like_dislike" 
                  value="1" 
                  id="rating-1" 
                  defaultChecked={initialValues?.like_dislike === 1}
                />
                <Label htmlFor="rating-1" className="cursor-pointer">Lo recomiendo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="like_dislike" 
                  value="2" 
                  id="rating-2" 
                  defaultChecked={initialValues?.like_dislike === 2}
                />
                <Label htmlFor="rating-2" className="cursor-pointer">Lo Super Recomiendo</Label>
              </div>
            </div>
          </div>

          {/* Nivel de Dificultad */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Nivel de dificultad</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="workload_vote" 
                  value="0" 
                  id="difficulty-0" 
                  defaultChecked={initialValues?.workload_vote === 0}
                />
                <Label htmlFor="difficulty-0" className="cursor-pointer">Baja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="workload_vote" 
                  value="1" 
                  id="difficulty-1" 
                  defaultChecked={initialValues?.workload_vote === 1}
                />
                <Label htmlFor="difficulty-1" className="cursor-pointer">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="workload_vote" 
                  value="2" 
                  id="difficulty-2" 
                  defaultChecked={initialValues?.workload_vote === 2}
                />
                <Label htmlFor="difficulty-2" className="cursor-pointer">Alta</Label>
              </div>
            </div>
          </div>

          {/* Tiempo de Asistencia */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tiempo de asistencia</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="attendance_type" 
                  value="0" 
                  id="assistance-0" 
                  defaultChecked={initialValues?.attendance_type === 0}
                />
                <Label htmlFor="assistance-0" className="cursor-pointer">Obligatoria</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="attendance_type" 
                  value="1" 
                  id="assistance-1" 
                  defaultChecked={initialValues?.attendance_type === 1}
                />
                <Label htmlFor="assistance-1" className="cursor-pointer">Opcional</Label>
              </div>
            </div>
          </div>

          {/* Detalles del Curso */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Detalles del curso</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="weekly_hours"
                type="number"
                placeholder="Horas de dedicación semanal"
                min="0"
                max="168"
                defaultValue={initialValues?.weekly_hours || ''}
              />
              <Input
                name="year_taken"
                type="number"
                placeholder="Año cursado"
                min="2000"
                max="2030"
                defaultValue={initialValues?.year_taken || ''}
              />
            </div>
            <select 
              name="semester_taken" 
              className="w-full p-2 border rounded-md"
              defaultValue={initialValues?.semester_taken || ''}
            >
              <option value="">Seleccionar semestre</option>
              <option value="1">Primer semestre</option>
              <option value="2">Segundo semestre</option>
              <option value="3">TAV</option>
            </select>
          </div>

          {/* Comentarios */}
          <div className="space-y-3">
            <Label htmlFor="comment" className="text-sm font-medium">Comentarios</Label>
                  <Textarea
                    id="comment"
                    name="comment"
                    placeholder="Comparte tu experiencia..."
                    className="min-h-[100px]"
                    maxLength={10000}
                    defaultValue={initialValues?.comment ?? ''}
                  />
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={pending}>
              {pending ? 'Enviando...' : initialValues ? 'Actualizar Reseña' : 'Enviar Reseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}