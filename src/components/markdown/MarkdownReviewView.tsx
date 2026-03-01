"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { Pill } from "@/components/ui/pill";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import ReactMarkdown from "react-markdown";

type PillVariant = ComponentProps<typeof Pill>["variant"];
type PillSize = ComponentProps<typeof Pill>["size"];

export function MarkdownReviewView({
  path,
  imgAllow = false,
}: {
  path: string;
  imgAllow?: boolean;
}) {
  const [text, setText] = useState("Cargando...");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!path) {
      setError(true);
      return;
    }

    fetch(`/api/reviews?path=${encodeURIComponent(path)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al cargar markdown");
        const content = await res.text();
        setText(content);
      })
      .catch((err) => {
        console.error("Error cargando Markdown:", err);
        setError(true);
      });
  }, [path]);

  if (error) {
    return <blockquote>Error cargando contenido.</blockquote>;
  }

  return (
    <article className="prose max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          pill: ({ node, children }: any) => {
            const props = node?.properties ?? {};
            return (
              <Pill variant={props.variant as PillVariant} size={props.size as PillSize}>
                {children}
              </Pill>
            );
          },
          img: ({ node }: any) => {
            if (!imgAllow) return null;
            const { src, alt, title } = node?.properties || {};
            return (
              <img
                src={src as string}
                alt={(alt as string) || ""}
                title={title as string}
                className="h-auto max-w-full rounded-md"
              />
            );
          },
        } as any}
      >
        {text}
      </ReactMarkdown>
    </article>
  );
}
