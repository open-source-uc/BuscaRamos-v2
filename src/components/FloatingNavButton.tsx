"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarIcon, BookIcon } from "@/components/icons/icons";

const SCHEDULE_PATH = "/horario";
const BACK_KEY = "fab_back_url";

export default function FloatingNavButton() {
  const pathname = usePathname();
  const router = useRouter();
  const isOnSchedule = pathname === SCHEDULE_PATH;

  const handleClick = () => {
    if (isOnSchedule) {
      const backUrl = sessionStorage.getItem(BACK_KEY) ?? "/";
      router.push(backUrl);
    } else {
      sessionStorage.setItem(BACK_KEY, pathname);
      router.push(SCHEDULE_PATH);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-primary text-primary-foreground focus:ring-primary tablet:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none"
      aria-label={isOnSchedule ? "Volver al curso" : "Ver mi horario"}
    >
      {isOnSchedule ? (
        <BookIcon className="h-6 w-6 fill-current" />
      ) : (
        <CalendarIcon className="h-6 w-6 fill-current" />
      )}
    </button>
  );
}
