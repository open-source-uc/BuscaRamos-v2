"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  path?: string; // opcional, si no se pasa usa window.location.href
  title?: string;
}

export default function ShareButton({ path, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = path ?? window.location.origin + path;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title ?? document.title,
          text: shareUrl,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("No se pudo copiar al portapapeles:", err);
      }
    }
  }

  return (
    <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </Button>
  );
}
