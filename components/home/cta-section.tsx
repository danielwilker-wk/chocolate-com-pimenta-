import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="relative py-28 md:py-36 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.03] to-transparent" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="font-display italic text-3xl md:text-5xl mb-6">
          Pronto para viver a experiência?
        </h2>
        <p className="text-mist mb-10 max-w-md mx-auto leading-relaxed">
          Reserve a sua mesa, visite as nossas lojas ou fale connosco pelo
          WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/reservas"
            className="inline-flex justify-center items-center bg-gold text-ink px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition-colors duration-300"
          >
            Fazer reserva
          </Link>
          <Link
            href="/contactos"
            className="inline-flex justify-center items-center border border-paper/30 text-paper px-8 py-4 text-xs tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Falar connosco
          </Link>
        </div>
      </div>
    </section>
  );
}
