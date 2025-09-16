"use client";

import { CourseReview } from "@/types/types";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import { deleteCourseReview } from "@/actions/user.reviews";
import { parse } from "path";

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
    console.log(res);
  }

  return (
    <Button onClick={() => handleDelete()} variant="destructive">
      <TrashIcon />
    </Button>
  );
}
