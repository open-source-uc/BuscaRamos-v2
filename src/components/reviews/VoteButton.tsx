"use client";

import { useEffect, useState, useRef } from "react";
import { VoteArrow } from "../icons/icons";
import { getVoteOnCourseReview, interactWithCourseReview } from "@/actions/user.reviews";

export default function VoteButtons({
  initialVotes = 0,
  reviewId,
}: {
  initialVotes?: number;
  reviewId: string | number;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible) {
            setHasBeenVisible(true);
          }
        });
      },
      { threshold: 0.1 } // dispara cuando al menos 10% del componente está visible
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasBeenVisible]);

  useEffect(() => {
    if (!hasBeenVisible) return;

    const fn = async () => {
      const res = await getVoteOnCourseReview(parseInt(reviewId.toString()));
      setUserVote(res.vote === 1 ? "up" : res.vote === -1 ? "down" : null);
    };
    fn();
  }, [hasBeenVisible, reviewId]);

  const getVoteCountColor = () => {
    if (votes > 0) return "text-green";
    if (votes < 0) return "text-red";
    return "text-muted-foreground";
  };

  return (
    <div
      ref={ref}
      className="bg-card/90 border-border flex flex-col items-center rounded-lg border p-1 shadow-sm backdrop-blur-sm"
    >
      <button
        className={`hover:bg-muted rounded-md p-1.5 transition-all duration-150 ${
          userVote === "up" ? "text-green bg-green-light" : "text-muted-foreground hover:text-green"
        }`}
        onClick={() => {
          interactWithCourseReview("up", parseInt(reviewId.toString())).then((res) => {
            setVotes(res.count ?? 0);
            setUserVote(res.userVote === 1 ? "up" : res.userVote === -1 ? "down" : null);
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
            setVotes(res.count ?? 0);
            setUserVote(res.userVote === 1 ? "up" : res.userVote === -1 ? "down" : null);
          });
        }}
        title="Downvote"
      >
        <VoteArrow direction="down" className="h-4 w-4 transition-colors" />
      </button>
    </div>
  );
}
