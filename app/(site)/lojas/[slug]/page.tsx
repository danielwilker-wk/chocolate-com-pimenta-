import { notFound } from "next/navigation";
import { MapPin, Clock, Phone } from "lucide-react";
import {
  getLojaBySlug,
  getProdutosByLoja,
  getLojas,
} from "@/lib/supabase/queries";
import { buildWhatsAppLink } from "@/lib/site-config";
import ProdutoCard from "@/components/lojas/produto-card";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const lojas = await getLojas();
    return lojas.map((loja) => ({ slug: loja.slug }));
  } catch {
    // Se o Supabase estiver indisponível durante o build, as páginas
    // são geradas dinamicamente em runtime em vez de estaticamente.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);
  return {
    title: loja?.nome ?? "Loja",
    description: `Descubra os produtos disponíveis em ${loja?.nome ?? "esta loja"}.`,
  };
}

export default async function LojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);

  if (!loja) notFound();

  const produtos = await getProdutosByLoja(loja.id);
  const whatsappNumber = loja.whatsapp || "[NÚMERO DE WHATSAPP]";
  const whatsappLink = buildWhatsAppLink(
    whatsappNumber,
    `Olá, Chocolate com Pimenta. Gostaria de obter informações sobre ${loja.nome}.`
  );

  const categorias = Array.from(
    new Set(produtos.map((p) => p.categoria_id).filter(Boolean))
  );

  return (
    <div className="pt-32 md:pt-40 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 items-start mb-20">
          <div className="aspect-[4/3] overflow-hidden bg-ink-soft border border-white/10">
            {loja.foto_url ? (
              <img
                src={loja.foto_url}
                alt={loja.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-mist text-sm">
                [FOTO DA {loja.nome.toUpperCase()}]
              </div>
            )}
          </div>

          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
              Nossas Lojas
            </p>
            <h1 className="font-display text-3xl md:text-5xl mb-6">
              {loja.nome}
            </h1>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-mist">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
                {loja.localizacao || "[LOCALIZAÇÃO DA LOJA]"}
              </li>
              <li className="flex items-start gap-3 text-mist">
                <Clock size={18} className="mt-0.5 shrink-0 text-gold" />
                {loja.horario || "[HORÁRIO DE FUNCIONAMENTO]"}
              </li>
              <li className="flex items-start gap-3 text-mist">
                <Phone size={18} className="mt-0.5 shrink-0 text-gold" />
                {loja.telefone || "[TELEFONE]"}
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center bg-gold text-ink px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition-colors duration-300"
              >
                Contactar via WhatsApp
              </a>
              <a
                href="#produtos"
                className="inline-flex justify-center items-center border border-paper/30 text-paper px-8 py-4 text-xs tracking-[0.15em] uppercase hover:border-gold hover:text-gold transition-colors duration-300"
              >
                Ver produtos
              </a>
            </div>
          </div>
        </div>

        <div id="produtos">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-display italic text-2xl text-gold whitespace-nowrap">
              Produtos disponíveis
            </h2>
            <div className="hairline flex-1" />
          </div>

          {produtos.length === 0 ? (
            <p className="text-mist">
              Catálogo desta loja a ser adicionado em breve.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  whatsapp={whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
