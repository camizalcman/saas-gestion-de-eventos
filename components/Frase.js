export default function Frase() {
  return (
    <section className="relative overflow-hidden py-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src="/frase.jpg"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-brand/70" />
      <div className="relative w-full max-w-6xl px-6 md:px-8">
        <blockquote className="mb-0 mt-24">
          <p className="text-4xl font-regular leading-tight tracking-tight text-surface sm:text-5xl">
            Cada celebración merece
          </p>
          <p className="text-4xl font-semibold leading-tight tracking-tight text-surface sm:text-5xl">
            <em className="font-bold italic">ser inolvidable.</em>
          </p>
        </blockquote>
      </div>
    </section>
  );
}
