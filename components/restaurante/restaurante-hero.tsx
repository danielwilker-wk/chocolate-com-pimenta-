import Link from "next/link";

export default function RestauranteHero() {
  return (
    <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2000&auto=format&fit=crop')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-ink" />

      <div className="relative z-10 text-center px-6">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-5">
          Restaurante & Bar
        </p>
        <h1 className="font-display text-4xl md:text-6xl mb-5">
          Sabores que <span className="italic text-gold">despertam</span> os
          sentidos.
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a
            href="#menu"
            className="inline-flex justify-center items-center bg-gold text-ink px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition-colors duration-300"
          >
            Ver menu
          </a>
          <Link
            href="/reservas"
            className="inline-flex justify-center items-center border border-paper/40 text-paper px-8 py-4 text-xs tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Fazer reserva
          </Link>
        </div>
      </div>
    </section>
  );
}
