import {
  getSecoesConteudo,
  getImagensPorPosicao,
} from "@/lib/supabase/queries";

export const metadata = {
  title: "Sobre a marca",
  description: "Conheça a história, valores, missão e visão da Chocolate com Pimenta.",
};

export const dynamic = "force-dynamic";

function textoSecao(
  secoes: { chave: string; titulo: string | null; corpo: string | null }[],
  chave: string
) {
  return secoes.find((s) => s.chave === chave)?.corpo?.trim() || null;
}

export default async function SobrePage() {
  const [secoes, imagensPrincipais, imagensGaleria] = await Promise.all([
    getSecoesConteudo(),
    getImagensPorPosicao("sobre_principal"),
    getImagensPorPosicao("sobre_galeria"),
  ]);

  const historia = textoSecao(secoes, "sobre_historia");
  const valores = textoSecao(secoes, "sobre_valores");
  const missao = textoSecao(secoes, "sobre_missao");
  const visao = textoSecao(secoes, "sobre_visao");
  const imagemPrincipal = imagensPrincipais[0];

  return (
    <div className="pt-32 md:pt-40 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Chocolate com Pimenta
          </p>
          <h1 className="font-display text-3xl md:text-5xl">
            A nossa história
          </h1>
        </div>

        {/* História + imagem principal */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            {historia ? (
              <p className="text-mist leading-relaxed whitespace-pre-line">
                {historia}
              </p>
            ) : (
              <p className="text-mist italic">
                A nossa história está a ser escrita — volta em breve para
                conheceres a jornada da Chocolate com Pimenta.
              </p>
            )}
          </div>
          <div className="aspect-[4/5] bg-ink-soft border border-white/10 overflow-hidden">
            {imagemPrincipal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagemPrincipal.url}
                alt={imagemPrincipal.legenda || "Chocolate com Pimenta"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-mist text-sm text-center p-6">
                Imagem em breve
              </div>
            )}
          </div>
        </div>

        {/* Valores, Missão, Visão */}
        {(valores || missao || visao) && (
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {missao && (
              <div className="border-t border-gold/30 pt-6">
                <h2 className="font-display text-xl text-gold mb-3">
                  Missão
                </h2>
                <p className="text-mist text-sm leading-relaxed whitespace-pre-line">
                  {missao}
                </p>
              </div>
            )}
            {visao && (
              <div className="border-t border-gold/30 pt-6">
                <h2 className="font-display text-xl text-gold mb-3">
                  Visão
                </h2>
                <p className="text-mist text-sm leading-relaxed whitespace-pre-line">
                  {visao}
                </p>
              </div>
            )}
            {valores && (
              <div className="border-t border-gold/30 pt-6">
                <h2 className="font-display text-xl text-gold mb-3">
                  Os nossos valores
                </h2>
                <p className="text-mist text-sm leading-relaxed whitespace-pre-line">
                  {valores}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Galeria */}
        {imagensGaleria.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-display italic text-2xl text-gold whitespace-nowrap">
                Momentos
              </h2>
              <div className="hairline flex-1" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {imagensGaleria.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square bg-ink-soft border border-white/10 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.legenda || ""}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
