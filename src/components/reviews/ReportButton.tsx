"use client";

import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportCourseReview } from "@/actions/reviews";

interface ReportButtonProps {
  reviewId: number;
}

export default function ReportButton({ reviewId }: ReportButtonProps) {
  const handleReport = async () => {
    await reportCourseReview(reviewId);
  };

  return (
    <Button
      onClick={handleReport}
      variant="outline"
      size="default"
      className="flex items-center gap-2"
    >
      <Flag className="h-4 w-4" />
      Reportar
    </Button>
  );
}
