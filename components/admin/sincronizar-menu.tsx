"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { RefreshCw, Check } from "lucide-react";

export default function SincronizarMenu({
  onSincronizado,
}: {
  onSincronizado: () => void;
}) {
  const supabase = createClient();
  const [sincronizando, setSincronizando] = useState(false);
  const [resultado, setResultado] = useState<{
    criados: number;
    ignorados: number;
  } | null>(null);
  const [erro, setErro] = useState("");

  async function sincronizar() {
    setSincronizando(true);
    setErro("");
    setResultado(null);

    try {
      const [produtosRes, combosRes, categoriasRes, estoqueRes] =
        await Promise.all([
          supabase
            .from("menu_produtos")
            .select("nome, preco, categoria_id"),
          supabase.from("menu_combos").select("nome, preco"),
          supabase.from("menu_categorias").select("id, nome"),
          supabase.from("estoque_itens").select("nome"),
        ]);

      if (
        produtosRes.error ||
        combosRes.error ||
        categoriasRes.error ||
        estoqueRes.error
      ) {
        setErro("Não foi possível ler o menu ou o stock atual.");
        setSincronizando(false);
        return;
      }

      const categoriaPorId = new Map(
        (categoriasRes.data ?? []).map((c) => [c.id, c.nome])
      );

      // Nomes já existentes no stock, comparados sem diferenciar
      // maiúsculas/minúsculas, para evitar duplicados por diferenças
      // triviais de escrita.
      const nomesExistentes = new Set(
        (estoqueRes.data ?? []).map((i) => i.nome.trim().toLowerCase())
      );

      type CandidatoStock = {
        nome: string;
        preco_venda_restaurante: number | null;
        categoria: string | null;
        unidade: string;
        quantidade_atual: number;
        estoque_minimo: number;
      };

      const candidatos: CandidatoStock[] = [];
      let ignorados = 0;

      for (const p of produtosRes.data ?? []) {
        const chave = p.nome.trim().toLowerCase();
        if (nomesExistentes.has(chave)) {
          ignorados++;
          continue;
        }
        nomesExistentes.add(chave); // evita duplicados dentro do próprio menu
        candidatos.push({
          nome: p.nome.trim(),
          preco_venda_restaurante: p.preco,
          categoria: categoriaPorId.get(p.categoria_id) ?? null,
          unidade: "un",
          quantidade_atual: 0,
          estoque_minimo: 0,
        });
      }

      for (const c of combosRes.data ?? []) {
        const chave = c.nome.trim().toLowerCase();
        if (nomesExistentes.has(chave)) {
          ignorados++;
          continue;
        }
        nomesExistentes.add(chave);
        candidatos.push({
          nome: c.nome.trim(),
          preco_venda_restaurante: c.preco,
          categoria: "Combos",
          unidade: "un",
          quantidade_atual: 0,
          estoque_minimo: 0,
        });
      }

      if (candidatos.length > 0) {
        const { error: erroInsert } = await supabase
          .from("estoque_itens")
          .insert(candidatos);

        if (erroInsert) {
          setErro("Alguns produtos não puderam ser importados.");
          setSincronizando(false);
          return;
        }
      }

      setResultado({ criados: candidatos.length, ignorados });
      onSincronizado();
    } finally {
      setSincronizando(false);
    }
  }

  return (
    <div className="bg-ink-soft border border-gold/20 px-4 py-4 max-w-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium mb-1">
            Sincronizar produtos do Menu & Combos
          </p>
          <p className="text-mist text-xs">
            Cria no Stock os produtos do menu que ainda não existem aqui,
            usando o preço do menu como preço no Restaurante. Não duplica
            nem altera os que já tens.
          </p>
        </div>
        <button
          onClick={sincronizar}
          disabled={sincronizando}
          className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2.5 text-xs uppercase font-semibold hover:bg-white transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw size={14} className={sincronizando ? "animate-spin" : ""} />
          {sincronizando ? "A sincronizar..." : "Sincronizar com Menu"}
        </button>
      </div>

      {resultado && (
        <p className="text-gold text-xs mt-3 flex items-center gap-1.5">
          <Check size={13} />
          {resultado.criados} produtos criados
          {resultado.ignorados > 0 &&
            `, ${resultado.ignorados} já existiam e foram ignorados`}
          .
        </p>
      )}
      {erro && <p className="text-red-400 text-xs mt-3">{erro}</p>}
    </div>
  );
}
