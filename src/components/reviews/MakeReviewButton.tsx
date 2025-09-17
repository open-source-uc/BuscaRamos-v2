"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/authCtx";
import { use } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function MakeReviewButton({ sigle }: { sigle: string }) {
  const { user } = use(AuthContext);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construir la URL completa
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  return (
    <Button asChild>
      <Link
        href={
          user
            ? `/${sigle}/review`
            : `https://auth.osuc.dev/?href=${encodeURIComponent(currentUrl)}`
        }
      >
        Reseñar curso
      </Link>
    </Button>
  );
}
