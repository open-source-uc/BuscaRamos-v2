"use client";

import useComment from "@/hooks/useComment";
import dynamic from "next/dynamic";

function Comment({ path }: { path: string | null }) {
  const commentText = useComment(path);

  return <p>{commentText}</p>;
}

const CommentReview = dynamic(async () => Promise.resolve(Comment), {
  ssr: false,
});

export default CommentReview;
