"use client";

import type { Element, Text as HastText, Node } from "hast";
import type { ComponentProps, ReactNode } from "react";

import { Pill } from "@/components/ui/Pill";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import ReactMarkdown, { Components } from "react-markdown";
import Image from "next/image";
import { visit } from "unist-util-visit";

type PillVariant = ComponentProps<typeof Pill>["variant"];
type PillSize = ComponentProps<typeof Pill>["size"];

const rehypeHighlightSearch = (searchValue: string) => {
  return (tree: Node) => {
    if (!searchValue.trim()) return;

    const escapedSearch = searchValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedSearch})`, "gi");

    visit(tree, "text", (node: HastText, index, parent: Element) => {
      if (!parent || typeof index !== "number") return;

      if (["code", "mark", "script", "style", "a"].includes(parent.tagName)) return;

      const text = node.value;
      if (!regex.test(text)) return;

      const parts = text.split(regex);

      const newNodes = parts
        .map((part): Element | HastText => {
          if (part.toLowerCase() === searchValue.toLowerCase()) {
            return {
              type: "element",
              tagName: "mark",
              properties: { className: ["highlight"] },
              children: [{ type: "text", value: part }],
            };
          }
          return { type: "text", value: part };
        })
        .filter((n) => n.type === "element" || (n as HastText).value !== "");
      parent.children.splice(index, 1, ...newNodes);

      return index + newNodes.length;
    });
  };
};

export function MarkdownReviewView({
  markdown,
  searchValue = "",
  imgAllow = false,
  markdownLoading,
  markdownError,
}: {
  markdown: string;
  searchValue?: string;
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
        rehypePlugins={[rehypeRaw, () => rehypeHighlightSearch(searchValue)]}
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
            mark: ({ children }) => (
              <mark className="bg-green text-black rounded-sm px-1">{children}</mark>
            ),
          } as Components
        }
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
