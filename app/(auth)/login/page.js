import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

const loginBgLqip =
  "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAYABADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAUGAQT/xAAhEAACAQQCAgMAAAAAAAAAAAABAgMABBExEiETQQVhof/EABYBAQEBAAAAAAAAAAAAAAAAAAIAAf/EABYRAQEBAAAAAAAAAAAAAAAAAAEAEf/aAAwDAQACEQMRAD8AZ/KrzsZFHRII39VF2FnG1yWuuXjjHLC7bvAq08CtAEYsg2CWyd6zXCbJpBKHjXRDOFALHYAH5RRkZNBDCSJMAjPsZrTyaTogg+sUUVpTf//Z";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative h-screen overflow-hidden bg-surface text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-full lg:w-1/2"
      >
        <Image
          alt=""
          blurDataURL={loginBgLqip}
          className="object-cover"
          fill
          placeholder="blur"
          sizes="(min-width: 1024px) 50vw, 100vw"
          src="/login-bg.jpg"
        />
        <div className="absolute inset-0 bg-brand/40 lg:bg-brand/20" />
      </div>

      <section className="relative z-10 flex h-full items-center justify-center p-4 sm:p-6 lg:ml-auto lg:w-1/2 lg:border-l lg:border-accent lg:bg-surface lg:p-10 xl:p-14">
        <Link
          className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 text-sm font-semibold text-surface transition hover:text-secondary lg:text-brand"
          href="/"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className="grid max-h-full w-full max-w-md overflow-hidden rounded-2xl border border-brand bg-surface/95 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm lg:max-h-none lg:max-w-lg lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
          <div className="flex min-h-0 items-center justify-center overflow-y-auto p-5 sm:p-7 lg:p-0">
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
