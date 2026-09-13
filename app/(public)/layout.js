import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }) {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentUserProfile(user) : null;

  return (
    <>
      <Navbar user={user} profile={profile} />
      {children}
      <Footer />
    </>
  );
}