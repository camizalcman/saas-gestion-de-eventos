"use client";

import { usePathname } from "next/navigation";

export default function AppMain({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isNewEvent = pathname === "/dashboard/evento/nuevo";

  return (
    <main
      className={
        isNewEvent
          ? "min-w-0 flex-1 h-screen overflow-hidden"
          : isDashboard
          ? "min-w-0 flex-1 overflow-y-auto lg:h-screen"
          : "min-w-0 flex-1 min-h-screen"
      }
    >
      <div
        className={`mx-auto flex w-full flex-col ${
          isNewEvent
            ? "h-full max-w-none p-0"
            : "max-w-6xl px-4 pt-20 pb-5 md:px-6 md:pt-20 md:pb-5 lg:px-1 lg:pt-5"
        } ${
          isDashboard || isNewEvent ? "h-full" : "min-h-screen"
        }`}
      >
        {children}
      </div>
    </main>
  );
}
