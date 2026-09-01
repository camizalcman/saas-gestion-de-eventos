import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />
      <section className="grid min-h-[calc(100vh-65px)] place-items-center px-4 py-8 sm:px-5 sm:py-10">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-accent bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.15)] lg:grid-cols-2">
          <div className="relative min-h-[300px] lg:min-h-[620px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Fiesta"
              src="/fotoLoginFiesta.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-center p-5 sm:p-7 lg:p-10">
            <LoginForm />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
