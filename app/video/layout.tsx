import type { ReactNode } from "react";

// Video page has its own dark header — no global navbar
export default function VideoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
