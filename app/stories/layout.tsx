import type { ReactNode } from "react";

// Stories is fullscreen — no navbar wrapper needed
export default function StoriesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
