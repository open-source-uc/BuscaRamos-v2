"use client";

import type { Element } from "hast";
import type { ComponentProps, ReactNode } from "react";

import { Pill } from "@/components/ui/Pill";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import ReactMarkdown, { Components } from "react-markdown";
import Image from "next/image";

type PillVariant = ComponentProps<typeof Pill>["variant"];
type PillSize = ComponentProps<typeof Pill>["size"];

export function MarkdownReviewView({
  markdown,
  imgAllow = false,
  markdownLoading,
  markdownError,
}: {
  markdown: string;
  imgAllow?: boolean;
  markdownLoading: boolean;
  markdownError: boolean;
}) {
  if (markdownError) {
    return <blockquote>Error cargando contenido.</blockquote>;
  }

  if (markdownLoading) {
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
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
