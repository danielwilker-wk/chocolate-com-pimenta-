import Link from "next/link";
import Image from "next/image";
import { getImagensPorPosicao } from "@/lib/supabase/queries";

export default async function Hero() {
  // Se o admin tiver definido uma imagem de fundo em "Conteúdo do site",
  // usa-a; senão, mostra o logo como fallback elegante.
  const imagensFundo = await getImagensPorPosicao("hero_home");
  const fundoPersonalizado = imagensFundo[0]?.url;

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden flex items-center justify-center bg-ink">
      {fundoPersonalizado ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fundoPersonalizado}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-ink" />
        </>
      ) : (
        <>
          {/* Fundo: logo ampliado e desfocado, para textura sem competir com o texto */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20 blur-2xl scale-150">
            <Image
              src="/logo.jpeg"
              alt=""
              width={900}
              height={635}
              className="object-contain"
              priority
              aria-hidden
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        </>
      )}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-hero-in">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.jpeg"
            alt="Chocolate com Pimenta"
            width={140}
            height={99}
            className="w-28 md:w-36 h-auto object-contain"
            priority
          />
        </div>
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
