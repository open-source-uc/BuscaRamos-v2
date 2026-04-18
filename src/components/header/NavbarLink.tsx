import Link from "next/link";
import { ReactNode } from "react";

interface NavbarLinkProps {
  href: string;
  children: ReactNode;
}

export default function NavbarLink({ href, children }: NavbarLinkProps) {
  return (
    <Link
      href={href}
      className="text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-muted"
    >
      {children}
    </Link>
  );
}
