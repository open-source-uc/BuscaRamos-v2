"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/authCtx";
import { use, useMemo } from "react";

export default function MakeReviewButton({ sigle }: { sigle: string }) {
  const { user } = use(AuthContext);
  const url = useMemo(() => window.location.href, []);

  // Construir la URL completa

  return (
    <Button asChild>
      <Link
        href={
          user
            ? `/${sigle}/review`
            : `https://auth.osuc.dev/?href=${encodeURIComponent(url)}`
        }
      >
        Reseñar curso
      </Link>
    </Button>
  );
}
