"use client";

import { CourseReview } from "@/types/types";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import { deleteCourseReview } from "@/actions/user.reviews";
import { toast } from "sonner";

interface TrashProps {
  review: CourseReview;
}

export default function Trash({ review }: TrashProps) {
  async function handleDelete() {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    const res = await deleteCourseReview(review.id);
    toast.warning(res.message);
  }

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        handleDelete();
      }}
      variant="red"
    >
      <TrashIcon />
    </Button>
  );
}
