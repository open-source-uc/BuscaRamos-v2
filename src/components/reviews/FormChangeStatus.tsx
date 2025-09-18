"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { NULL_STRING } from "@/types/types";
import useForm from "@/hooks/useForm";
import { changeStatusReview } from "@/actions/user.reviews";
import { useEffect } from "react";

export default function ChangeStatusForm({ review_id }: { review_id: number }) {
  const [state, action, pending] = useForm(changeStatusReview, {
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        action(new FormData(e.currentTarget));
      }}
      className="border border-border rounded-lg p-4 bg-yellow-50"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <input type="hidden" name="review_id" value={review_id} />
          <label className="block text-sm font-medium text-foreground mb-2">
            Acción a realizar
          </label>
          <select
            name="status"
            required
            className="w-full border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled selected>
              Seleccionar acción
            </option>
            <option value="1">✅ Aprobar reseña</option>
            <option value="3">❌ Ocultar reseña</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="default" size="sm" disabled={pending}>
            Aplicar Acción
          </Button>
        </div>
      </div>
    </form>
  );
}
