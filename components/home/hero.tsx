import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop')",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-ink" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-hero-in">
        <p className="text-gold text-xs md:text-sm tracking-[0.35em] uppercase mb-6 font-body font-medium">
          Chocolate com Pimenta
        </p>
        <h1 className="font-display italic text-4xl sm:text-5xl md:text-7xl leading-[1.08] text-paper mb-6">
          Uma marca.
          <br />
          <span className="text-gold">Diferentes experiências.</span>
        </h1>
        <p className="text-mist text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Gastronomia, entretenimento, produtos e experiências reunidos num só
          lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#negocios"
            className="w-full sm:w-auto inline-flex justify-center items-center bg-gold text-ink px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition-colors duration-300"
          >
            Explorar a marca
          </a>
          <Link
            href="/reservas"
            className="w-full sm:w-auto inline-flex justify-center items-center border border-paper/40 text-paper px-8 py-4 text-xs tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Fazer reserva
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-70">
        <span className="text-[10px] tracking-[0.3em] text-mist uppercase">
          Descubra
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}
