import { buildWhatsAppLink } from "@/lib/site-config";
import type { Produto } from "@/lib/supabase/queries";

export default function ProdutoCard({
  produto,
  whatsapp,
}: {
  produto: Produto;
  whatsapp: string;
}) {
  const link = buildWhatsAppLink(
    whatsapp,
    `Olá, Chocolate com Pimenta. Gostaria de adicionar ao pedido: ${produto.nome}.`
  );

  return (
    <div className="border border-white/10 hover:border-gold/30 transition-colors duration-300 flex flex-col">
      <div className="aspect-square overflow-hidden bg-ink-soft">
        {produto.foto_url ? (
          <img
            src={produto.foto_url}
            alt={produto.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mist text-xs text-center p-4">
            [FOTO DO PRODUTO]
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg mb-1">{produto.nome}</h3>
        {produto.descricao && (
          <p className="text-mist text-sm leading-relaxed mb-3 flex-1">
            {produto.descricao}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="text-gold font-display">
            {produto.preco
              ? `${produto.preco.toLocaleString("pt-PT")} Kz`
              : "[PREÇO]"}
          </span>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.1em] uppercase border border-gold/40 text-gold px-3 py-2 hover:bg-gold hover:text-ink transition-colors duration-300"
          >
            Adicionar ao pedido
          </a>
        </div>
      </div>
    </div>
  );
}
