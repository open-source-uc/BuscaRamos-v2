"use client";

import { useState } from "react";
import { VoteArrow } from "../icons/icons";
import { interactWithCourseReview } from "@/actions/user.reviews";
import { toast } from "sonner";

export default function VoteButtons({
  initialVotes = 0,
  reviewId,
  initialVote = null,
}: {
  initialVotes?: number;
  reviewId: string | number;
  initialVote?: -1 | 1 | null;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    initialVote === 1 ? "up" : initialVote === -1 ? "down" : null
  );

  const getVoteCountColor = () => {
    if (votes > 0) return "text-green";
    if (votes < 0) return "text-red";
    return "text-muted-foreground";
  };

  return (
    <div className="bg-card/90 border-border flex flex-col items-center rounded-lg border p-1 shadow-sm backdrop-blur-sm">
      <button
        className={`hover:bg-muted rounded-md p-1.5 transition-all duration-150 ${
          userVote === "up" ? "text-green bg-green-light" : "text-muted-foreground hover:text-green"
        }`}
        onClick={() => {
          interactWithCourseReview("up", parseInt(reviewId.toString())).then((res) => {
            if (!res.success) {
              toast.error(res.message);
              return;
            }
            setVotes(res.count ?? 0);
            setUserVote(res.userVote === 1 ? "up" : res.userVote === -1 ? "down" : null);
            toast.success("Voto registrado");
          });
        }}
        title="Upvote"
      >
        <VoteArrow direction="up" className="h-4 w-4 transition-colors" />
      </button>

      <span
        className={`min-w-[24px] px-1 py-0.5 text-center text-xs font-semibold transition-colors ${getVoteCountColor()}`}
      >
        {votes > 0 ? `+${votes}` : votes}
      </span>

      <button
        className={`hover:bg-muted rounded-md p-1.5 transition-all duration-150 ${
          userVote === "down" ? "text-red bg-red-light" : "text-muted-foreground hover:text-red"
        }`}
        onClick={() => {
          interactWithCourseReview("down", parseInt(reviewId.toString())).then((res) => {
            if (!res.success) {
              toast.error(res.message);
              return;
            }
            setVotes(res.count ?? 0);
            setUserVote(res.userVote === 1 ? "up" : res.userVote === -1 ? "down" : null);
            toast.success("Voto registrado");
          });
        }}
        title="Downvote"
      >
        <VoteArrow direction="down" className="h-4 w-4 transition-colors" />
      </button>
    </div>
  );
}
