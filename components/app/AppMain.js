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
          ? "min-w-0 flex-1 h-screen overflow-hidden pl-0"
          : isDashboard
          ? "min-w-0 flex-1 overflow-y-auto pl-0 lg:h-screen lg:pl-0"
          : "min-w-0 flex-1 min-h-screen pl-0 lg:pl-0"
      }
    >
      <div
        className={`mx-auto flex w-full flex-col ${
          isNewEvent
            ? "h-full max-w-none p-0"
            : "max-w-6xl px-4 pt-20 pb-5 md:px-6 md:py-5 lg:px-1"
        } ${
          isDashboard || isNewEvent ? "h-full" : "min-h-screen"
        }`}
      >
        {children}
      </div>
    </main>
  );
}
