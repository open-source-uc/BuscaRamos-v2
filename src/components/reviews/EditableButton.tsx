"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditIcon } from "../icons";

interface EditReviewLinkProps {
  reviewId: number;
}

export default function EditableButton({ reviewId }: EditReviewLinkProps) {
  return (
    <Button asChild size="default" className="flex items-center gap-2">
      <Link href={`/review/${reviewId}/edit`}>
        <EditIcon className="h-4 w-4" />
      </Link>
    </Button>
  );
}
