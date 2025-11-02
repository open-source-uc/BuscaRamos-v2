"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { CourseReview, NULL_STRING } from "@/types/types";
import useForm from "@/hooks/useForm";
import { changeStatusReview } from "@/actions/user.reviews";
import { useEffect } from "react";

export default function ChangeStatusForm({ review }: { review: CourseReview }) {
  const [state, action, pending] = useForm(changeStatusReview, {
    message: NULL_STRING,
  });

  useEffect(() => {
    if (state.message === NULL_STRING) return;

    state.success ? toast.success(state.message) : toast.error(state.message);
  }, [state.message, state.success]);

  return (
    <section className="bg-yellow-50">
      {/* Cabecera */}
      <header className="bg-yellow-100 px-6 py-3">
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">Enviada:</span>{" "}
          {new Date(review.created_at).toLocaleDateString("es-CL", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </header>

      {/* Formulario */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          action(new FormData(e.currentTarget));
        }}
        className="p-6 flex flex-col gap-4"
      >
        <input type="hidden" name="review_id" value={review.id} />

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
              Acción a realizar
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue=""
              className="w-full px-3 py-2 text-sm bg-yellow-200 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="" disabled>
                Seleccionar acción
              </option>
              <option value="1">✅ Aprobar reseña</option>
              <option value="3">❌ Ocultar reseña</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button type="submit" variant="default" size="sm" disabled={pending}>
              {pending ? "Aplicando..." : "Aplicar acción"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
