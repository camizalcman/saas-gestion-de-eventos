import Faq from "@/components/Faq";
import Frase from "@/components/Frase";
import Funcionalidades from "@/components/Funcionalidades";
import Hero from "@/components/Hero";
import Pasos from "@/components/Pasos";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Hero user={user} />
      <Funcionalidades />
      <Pasos />
      <Frase />
      <Faq />
    </main>
  );
}