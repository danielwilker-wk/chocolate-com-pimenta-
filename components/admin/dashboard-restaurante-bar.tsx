"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";

type Area = "bar" | "restaurante";

type ItemBaixo = {
  id: string;
  nome: string;
  unidade: string;
  quantidade_atual: number;
  estoque_minimo: number;
};

type VendaRecente = {
  id: string;
  quantidade: number;
  preco_total: number;
  criado_em: string;
  estoque_itens: { nome: string } | null;
};

type ResumoArea = {
  receitaHoje: number;
  vendasHoje: number;
  stockBaixo: ItemBaixo[];
  ultimasVendas: VendaRecente[];
};

const AREA_LABEL: Record<Area, string> = {
  bar: "Bar",
  restaurante: "Restaurante",
};

export default function DashboardRestauranteBar() {
  const supabase = createClient();
  const [resumo, setResumo] = useState<Record<Area, ResumoArea> | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const [itensRes, vendasRes] = await Promise.all([
      supabase
        .from("estoque_itens")
        .select("id, nome, unidade, area, quantidade_atual, estoque_minimo")
        .not("area", "is", null)
        .eq("ativo", true),
      supabase
        .from("vendas")
        .select("id, quantidade, preco_total, area, criado_em, estoque_itens(nome)")
        .gte("criado_em", inicioDoDia.toISOString())
        .order("criado_em", { ascending: false }),
    ]);

    if (itensRes.error || vendasRes.error) {
      setErro("Não foi possível carregar os dados.");
      setLoading(false);
      return;
    }

    const itens = itensRes.data ?? [];
    const vendas = (vendasRes.data as unknown as (VendaRecente & { area: Area })[]) ?? [];

    function resumoDe(area: Area): ResumoArea {
      const vendasArea = vendas.filter((v) => v.area === area);
      return {
        receitaHoje: vendasArea.reduce((soma, v) => soma + v.preco_total, 0),
        vendasHoje: vendasArea.length,
        stockBaixo: itens.filter(
          (i) => i.area === area && i.quantidade_atual <= i.estoque_minimo
        ),
        ultimasVendas: vendasArea.slice(0, 5),
      };
    }

    setResumo({ bar: resumoDe("bar"), restaurante: resumoDe("restaurante") });
    setErro("");
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) {
    return <p className="text-mist">A carregar...</p>;
  }

  if (erro || !resumo) {
    return (
      <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3">
        {erro || "Não foi possível carregar o painel."}
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <PainelArea area="bar" resumo={resumo.bar} />
      <PainelArea area="restaurante" resumo={resumo.restaurante} />
    </div>
  );
}

function PainelArea({ area, resumo }: { area: Area; resumo: ResumoArea }) {
  return (
    <div className="border border-white/10 bg-ink-soft p-6 space-y-6">
      <h2 className="font-display text-xl text-gold">{AREA_LABEL[area]}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-mist text-xs uppercase tracking-wide">
            Receita de hoje
          </p>
          <p className="text-2xl font-display mt-1">
            {resumo.receitaHoje.toLocaleString("pt-PT")} Kz
          </p>
        </div>
        <div>
          <p className="text-mist text-xs uppercase tracking-wide">
            Vendas de hoje
          </p>
          <p className="text-2xl font-display mt-1">{resumo.vendasHoje}</p>
        </div>
      </div>

      <div>
        <p className="text-mist text-xs uppercase tracking-wide mb-2">
          Stock baixo ({resumo.stockBaixo.length})
        </p>
        {resumo.stockBaixo.length === 0 ? (
          <p className="text-mist text-sm">Tudo dentro do previsto.</p>
        ) : (
          <div className="space-y-1.5">
            {resumo.stockBaixo.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate">{item.nome}</span>
                <span className="text-red-400 shrink-0">
                  {item.quantidade_atual} {item.unidade}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-mist text-xs uppercase tracking-wide mb-2">
          Últimas vendas
        </p>
        {resumo.ultimasVendas.length === 0 ? (
          <p className="text-mist text-sm">Ainda não há vendas hoje.</p>
        ) : (
          <div className="space-y-1.5">
            {resumo.ultimasVendas.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate">
                  {v.quantidade}x {v.estoque_itens?.nome ?? "Item removido"}
                </span>
                <span className="text-gold shrink-0">
                  {v.preco_total.toLocaleString("pt-PT")} Kz
                </span>
                <span className="text-mist text-xs shrink-0">
                  {new Date(v.criado_em).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
