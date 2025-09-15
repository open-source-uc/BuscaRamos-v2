"use client";

import { CourseReview } from "@/types/types";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import { deleteCourseReview } from "@/actions/user.reviews";
import { useRouter } from "next/navigation";

interface TrashProps {
  review?: CourseReview;
}



export default function Trash({ review }: TrashProps) {
  const router = useRouter();
  if (!review) return null;

  return (
    <Button onClick={async () => {
      await deleteCourseReview(review.id)
       router.push("/" + review.course_sigle);
      }}>
      <TrashIcon />
    </Button>
  );
}
