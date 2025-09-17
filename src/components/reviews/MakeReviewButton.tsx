"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/authCtx";
import { use, useEffect, useState } from "react";

export default function MakeReviewButton({ sigle }: { sigle: string }) {
  const { user } = use(AuthContext);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <Button asChild>
      <Link href={user ? `/${sigle}/review` : `https://auth.osuc.dev/?href=${url}`}>
        Reseñar curso
      </Link>
    </Button>
  );
}
