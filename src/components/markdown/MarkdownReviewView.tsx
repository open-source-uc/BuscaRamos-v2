"use client";

import useSWR from "swr";
import type { Element } from "hast";
import type { ComponentProps, ReactNode } from "react";

import { Pill } from "@/components/ui/pill";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import ReactMarkdown, { Components } from "react-markdown";
import Image from "next/image";

type PillVariant = ComponentProps<typeof Pill>["variant"];
type PillSize = ComponentProps<typeof Pill>["size"];

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar markdown.");
    return res.text();
  });

export function MarkdownReviewView({
  path,
  imgAllow = false,
}: {
  path: string;
  imgAllow?: boolean;
}) {
  const {
    data: text,
    error,
    isLoading,
  } = useSWR(path ? `/api/reviews?path=${encodeURIComponent(path)}` : null, fetcher);

  if (error) {
    return <blockquote>Error cargando contenido.</blockquote>;
  }

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  return (
    <article className="prose max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={
          {
            pill: ({ node, children }: { node: Element; children: ReactNode }) => {
              const props = node?.properties ?? {};
              return (
                <Pill variant={props.variant as PillVariant} size={props.size as PillSize}>
                  {children}
                </Pill>
              );
            },
            img: ({ node }: { node: Element }) => {
              if (!imgAllow) return null;
              const { src, alt, title } = node?.properties || {};
              return (
                <Image
                  src={src as string}
                  alt={(alt as string) || ""}
                  title={title as string}
                  className="h-auto max-w-full rounded-md"
                />
              );
            },
          } as Components
        }
      >
        {text}
      </ReactMarkdown>
    </article>
  );
}
