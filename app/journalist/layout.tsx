import type { ReactNode } from "react";

// Journalist page has its own Navbar fetched server-side
export default function JournalistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
