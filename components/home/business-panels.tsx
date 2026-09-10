import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { getImagensPorPosicao } from "@/lib/supabase/queries";

const POSICAO_POR_ID: Record<string, string> = {
  restaurante: "negocio_restaurante",
  loja01: "negocio_loja01",
  loja02: "negocio_loja02",
};

export default async function BusinessPanels() {
  // Busca a imagem personalizada (se definida no admin) para cada negócio,
  // mantendo a imagem padrão do site-config como fallback.
  const imagensPorNegocio = await Promise.all(
    siteConfig.businesses.map(async (biz) => {
      const posicao = POSICAO_POR_ID[biz.id];
      if (!posicao) return null;
      const imagens = await getImagensPorPosicao(posicao);
      return imagens[0]?.url ?? null;
    })
  );

  return (
    <section id="negocios" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            A marca
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            Explore os nossos negócios
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-1 lg:h-[560px]">
          {siteConfig.businesses.map((biz, i) => {
            const imagem = imagensPorNegocio[i] || biz.image;
            return (
              <Link
                key={biz.id}
                href={biz.href}
                className="group relative h-80 lg:h-full overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagem}
                  alt={biz.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/95" />

                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <div className="hairline w-10 mb-4 opacity-70" />
                  <h3 className="font-display text-2xl md:text-3xl text-paper mb-3">
                    {biz.title}
                  </h3>
                  <p className="text-mist text-sm leading-relaxed max-w-xs mb-6">
                    {biz.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold text-xs tracking-[0.15em] uppercase">
                    {biz.cta}
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
