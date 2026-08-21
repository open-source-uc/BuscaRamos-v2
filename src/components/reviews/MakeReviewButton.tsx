"use client";

import { Button } from "../ui/Button";
import { AuthContext } from "@/context/authCtx";
import { use } from "react";
import { useRouter } from "next/navigation";

export default function MakeReviewButton({ sigle }: { sigle: string }) {
  const router = useRouter();
  const { user } = use(AuthContext);

  const handleGoToProfile = () => {
    if (!user) {
      router.push("https://auth.osuc.dev?ref=" + window.location.origin + `/${sigle}`);
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
