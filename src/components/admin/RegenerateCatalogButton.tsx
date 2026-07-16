"use client";

import { useState } from "react";
import { RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import { regenerateCoursesCatalog } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export default function RegenerateCatalogButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await regenerateCoursesCatalog();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Error al regenerar el catálogo");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      loading={pending}
      loadingText="Regenerando catálogo..."
      disabled={pending}
    >
      <RefreshCwIcon className="h-4 w-4" />
      Regenerar catálogo
    </Button>
  );
}
