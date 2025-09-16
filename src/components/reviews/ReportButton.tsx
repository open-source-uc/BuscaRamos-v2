"use client";

import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportCourseReview } from "@/actions/reviews";
import { toast } from "sonner";

interface ReportButtonProps {
  reviewId: number;
}

export default function ReportButton({ reviewId }: ReportButtonProps) {
  const handleReport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await reportCourseReview(reviewId);
    toast.success("Reseña reportada. Gracias por tu ayuda.");
  };

  return (
    <Button
      onClick={(e) => handleReport(e)}
      variant="outline"
      size="default"
      className="flex items-center gap-2"
    >
      <Flag className="h-4 w-4" />
      Reportar
    </Button>
  );
}
