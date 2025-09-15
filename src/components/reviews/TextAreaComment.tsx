"use client";

import useComment from "@/hooks/useComment";
import { Textarea } from "../ui/textarea";
import dynamic from "next/dynamic";

interface TextAreaCommentProps extends React.ComponentProps<typeof Textarea> {
  path: string;
}

function TextArea({ path, ...props }: TextAreaCommentProps) {
  const commentText = useComment(path);

  return (
    <Textarea
      {...props} // pasa todos los props adicionales al Textarea
      defaultValue={commentText} // valor inicial traído del hook
    />
  );
}

// 👇 aquí usamos dynamic correctamente
const TextAreaComment = dynamic(async () => Promise.resolve(TextArea), {
  ssr: false,
});

export default TextAreaComment;
