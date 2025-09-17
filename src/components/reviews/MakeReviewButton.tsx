"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/authCtx";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MakeReviewButton({ sigle }: { sigle: string }) {
  const router = useRouter();
  const { user } = use(AuthContext);

  const handleGoToProfile = () => {
    if (!user) {
      router.push("https://auth.osuc.dev?ref=" + window.location.href);
      return;
    }
    router.push(`/${sigle}/review`);
  };
  return (
      <Button size="sm" onClick={handleGoToProfile}>
        Deja una reseña
      </Button>
  );
}
