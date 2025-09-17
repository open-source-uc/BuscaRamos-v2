"use client";

import { formatWeeklyHours } from "@/lib/courseStats";
import {
  AttendanceIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  WorkloadIcon,
} from "../icons";
import { Pill } from "../ui/pill";
import { CourseReview } from "@/types/types";
import ShareButton from "./ShareButton";
import ReportButton from "./ReportButton";
import VoteButton from "./VoteButton";
import { MarkdownReviewView } from "../markdown/MarkdownReviewView";
import EditableButton from "./EditableButton";
import { CourseData } from "@/lib/CoursesData";
import TrashButton from "./TrashButton";
import { AuthContext } from "@/context/authCtx";
import { use } from "react";
import Link from "next/link";

export default function Review({
  review,
  status = false,
  initialVote = null,
  hideLike = false,
  editable,
  course,
}: {
  review: CourseReview;
  initialVote?: -1 | 1 | null;
  status?: boolean;
  editable?: boolean;
  course?: CourseData;
  hideLike?: boolean;
}) {
  if (editable === undefined) {
    const { user } = use(AuthContext);
    editable = user?.userId === review.user_id;
  }

  return (
    <div className="relative bg-background border border-border flex flex-col gap-4 rounded-sm p-5 overflow-hidden w-full">
      {/* Header con sentimiento y votos */}
      <div className="flex justify-between items-start gap-4 w-full">
        {/* Sentimiento */}
        <div className="flex flex-col items-start gap-2">
          {/* Pill */}
          {course && (
            <section>
              <Link href={`/${course.sigle}`}>
                <p className="text-sm underline">{course.sigle}</p>
              </Link>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold mb-2 max-w-[75%]">{course.name}</h1>
              </div>
            </section>
          )}
          <div
            className={`flex gap-2 items-center p-2 border rounded-lg w-max ${
              review.like_dislike === 2
                ? "bg-green-light text-green border-green/20"
                : review.like_dislike === 1
                  ? "bg-blue-light text-blue border-blue/20"
                  : "bg-red-light text-red border-red/20"
            }`}
          >
            {review.like_dislike === 2 ? (
              <StarIcon className="h-5 w-5 fill-current" />
            ) : review.like_dislike === 1 ? (
              <ThumbUpIcon className="h-5 w-5 fill-current" />
            ) : (
              <ThumbDownIcon className="h-5 w-5 fill-current" />
            )}
            <span className="text-sm font-semibold whitespace-nowrap">
              {review.like_dislike === 2
                ? "Lo super recomiendo"
                : review.like_dislike === 1
                  ? "Lo recomiendo"
                  : "No lo recomiendo"}
            </span>
          </div>

          {/* Nombre del curso */}
        </div>

        {/* Botón de voto */}
        {hideLike || (
          <div className="flex-shrink-0">
            <VoteButton
              initialVotes={review.votes}
              reviewId={review.id}
              initialVote={initialVote}
            />
          </div>
        )}
      </div>

      {review.comment_path && (
        <div className="content-markdown max-w-full">
          <MarkdownReviewView path={review.comment_path} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          <Pill variant="ghost_green" size="sm" icon={CalendarIcon}>
            {review.year_taken} - {review.semester_taken === 1 ? "1er" : "2do"} sem
          </Pill>
          <Pill variant="ghost_blue" size="sm" icon={WorkloadIcon}>
            {review.workload_vote === 0
              ? "Dificultad Baja"
              : review.workload_vote === 1
                ? "Dificultad Normal"
                : "Dificultad Alta"}
          </Pill>
          <Pill variant="ghost_purple" size="sm" icon={AttendanceIcon}>
            {review.attendance_type === 0
              ? "Asistencia Obligatoria"
              : review.attendance_type === 1
                ? "Asistencia Opcional"
                : "Sin Asistencia"}
          </Pill>
          {review.weekly_hours && (
            <Pill variant="ghost_orange" size="sm" icon={ClockIcon}>
              {formatWeeklyHours(review.weekly_hours)}/sem
            </Pill>
          )}
          {status && (
            <Pill variant="pink" size="sm">
              Estado: {review.status === 3 ? " Baneada D:" : " Visible en la plataforma :D"}
            </Pill>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {editable && (
            <>
              <TrashButton review={review}></TrashButton>
              <EditableButton reviewId={review.id}></EditableButton>
            </>
          )}
          <ShareButton path={`/review/${review.id}`}></ShareButton>
          <ReportButton reviewId={review.id}></ReportButton>
        </div>
      </div>
    </div>
  );
}
