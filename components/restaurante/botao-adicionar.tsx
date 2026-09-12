"use client";

import { Plus, Minus } from "lucide-react";
import { useCarrinho } from "./carrinho-context";

export default function BotaoAdicionar({
  chave,
  produtoId,
  comboId,
  nome,
  preco,
}: {
  chave: string;
  produtoId?: string;
  comboId?: string;
  nome: string;
  preco: number | null;
}) {
  const { itens, adicionar, removerUm } = useCarrinho();
  const itemNoCarrinho = itens.find((i) => i.chave === chave);

  if (preco === null) return null;

  if (itemNoCarrinho) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => removerUm(chave)}
          aria-label="Remover uma unidade"
          className="w-7 h-7 flex items-center justify-center border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors"
        >
          <Minus size={12} />
        </button>
        <span className="text-gold text-sm w-4 text-center">
          {itemNoCarrinho.quantidade}
        </span>
        <button
          onClick={() => adicionar({ chave, produtoId, comboId, nome, preco })}
          aria-label="Adicionar mais uma unidade"
          className="w-7 h-7 flex items-center justify-center border border-gold/40 text-gold hover:bg-gold hover:text-ink transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => adicionar({ chave, produtoId, comboId, nome, preco })}
      className="shrink-0 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide border border-gold/40 text-gold px-3 py-2 hover:bg-gold hover:text-ink transition-colors"
    >
      <Plus size={12} /> Adicionar
    </button>
  );
}
