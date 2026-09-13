import Link from "next/link";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Frase from "@/components/Frase";
import Funcionalidades from "@/components/Funcionalidades";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Pasos from "@/components/Pasos";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentUserProfile(user) : null;

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar user={user} profile={profile} />
      <Hero user={user} />
      <Funcionalidades />
      <Pasos />
      <Frase />
      <Faq />

      <Footer />
    </main>
  );
}
