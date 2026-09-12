export default function Frase() {
  return (
    <section className="relative flex min-h-[70vh] py-16">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/frase3.jpg')" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-brand/70" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 md:px-8">
        <blockquote className="text-center">
          <p className="text-4xl font-serif font-regular leading-tight tracking-tight text-surface sm:text-5xl">
            Cada celebración
          </p>
          <p className="text-4xl font-semibold leading-tight tracking-tight text-surface sm:text-5xl">
            <em className="font-bold italic font-serif">merece ser inolvidable.</em>
          </p>
        </blockquote>
      </div>
    </section>
  );
}