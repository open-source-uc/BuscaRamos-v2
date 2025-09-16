"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditReviewLinkProps {
  reviewId: number;
}

export default function EditableButton({ reviewId }: EditReviewLinkProps) {
  return (
    <Button asChild size="default" className="flex items-center gap-2">
      <Link href={`/review/${reviewId}/edit`}>
        <Pencil className="h-4 w-4" />
      </Link>
    </Button>
  );
}
