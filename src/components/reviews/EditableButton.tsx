"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditIcon } from "../icons";

interface EditReviewLinkProps {
  reviewId: number;
}

export default function EditableButton({ reviewId }: EditReviewLinkProps) {
  return (
    <Button asChild variant="ghost_blue">
      <Link href={`/review/${reviewId}/edit`}>
        <EditIcon />
      </Link>
    </Button>
  );
}
