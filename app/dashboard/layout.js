import { cache } from "react";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

const getSessionUser = cache(async () => {
  return getCurrentUser();
});

const getSessionProfile = cache(async (user) => {
  return getCurrentUserProfile(user);
});

export default async function DashboardLayout({ children }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getSessionProfile(user);
  const isAdmin = profile?.user_type === "admin";

  return (
    <div className="min-h-screen bg-surface text-ink">
      <Navbar user={user} profile={profile} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-7 sm:px-6 lg:flex-row lg:gap-10 lg:px-8">
        <DashboardSidebar isAdmin={isAdmin} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
