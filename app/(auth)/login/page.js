import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative h-screen overflow-hidden bg-surface text-ink">
      <section className="grid h-full place-items-center">
        <div className="grid h-full w-full max-w-4xl overflow-hidden rounded-2xl border border-brand bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.15)] lg:grid-cols-2 lg:max-h-[560px]">
          <div className="relative h-full min-h-[300px] ">
            <Link
              className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-secondary"
              href="/"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Volver al inicio
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Fiesta"
              src="/fotoLoginFiesta.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex min-h-0 items-center justify-center overflow-y-auto p-5 sm:p-7 lg:px-10 lg:py-2">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
