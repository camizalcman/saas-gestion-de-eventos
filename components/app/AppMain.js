"use client";

import { usePathname } from "next/navigation";

export default function AppMain({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  return (
    <main
      className={
        isDashboard
          ? "min-w-0 flex-1 overflow-y-auto pl-16 lg:h-screen lg:pl-0"
          : "min-w-0 flex-1 min-h-screen pl-16 lg:pl-0"
      }
    >
      <div
        className={`mx-auto flex w-full max-w-6xl flex-col px-4 py-5 md:px-6 lg:px-1 ${
          isDashboard ? "h-full" : "min-h-screen"
        }`}
      >
        {children}
      </div>
    </main>
  );
}
