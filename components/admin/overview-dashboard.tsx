"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser-client";
import { ArrowUpRight } from "lucide-react";

type Resumo = {
  restaurante: {
    categorias: number;
    produtos: number;
    combos: number;
    reservasPendentes: number;
  };
  lojas: {
    slug: string;
    nome: string;
    localizacaoDefinida: boolean;
    totalProdutos: number;
    produtosDisponiveis: number;
  }[];
  eventos: number;
  mensagensNaoLidas: number;
};

export default function OverviewDashboard() {
  const supabase = createClient();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const [
        categoriasRes,
        produtosRes,
        combosRes,
        reservasRes,
        lojasRes,
        produtosLojaRes,
        eventosRes,
        mensagensRes,
      ] = await Promise.all([
        supabase.from("menu_categorias").select("id", { count: "exact", head: true }),
        supabase.from("menu_produtos").select("id", { count: "exact", head: true }),
        supabase.from("menu_combos").select("id", { count: "exact", head: true }),
        supabase
          .from("reservas")
          .select("id", { count: "exact", head: true })
          .eq("estado", "pendente"),
        supabase.from("lojas").select("id, slug, nome, localizacao").order("ordem"),
        supabase.from("produtos").select("id, loja_id, disponivel"),
        supabase.from("eventos").select("id", { count: "exact", head: true }),
        supabase
          .from("mensagens_contacto")
          .select("id", { count: "exact", head: true })
          .eq("lida", false),
      ]);

      const lojas = (lojasRes.data ?? []).map((loja) => {
        const produtosDaLoja = (produtosLojaRes.data ?? []).filter(
          (p) => p.loja_id === loja.id
        );
        return {
          slug: loja.slug,
          nome: loja.nome,
          localizacaoDefinida: !!loja.localizacao,
          totalProdutos: produtosDaLoja.length,
          produtosDisponiveis: produtosDaLoja.filter((p) => p.disponivel)
            .length,
        };
      });

      setResumo({
        restaurante: {
          categorias: categoriasRes.count ?? 0,
          produtos: produtosRes.count ?? 0,
          combos: combosRes.count ?? 0,
          reservasPendentes: reservasRes.count ?? 0,
        },
        lojas,
        eventos: eventosRes.count ?? 0,
        mensagensNaoLidas: mensagensRes.count ?? 0,
      });
      setLoading(false);
    }
    carregar();
  }, [supabase]);

  if (loading) return <p className="text-mist">A carregar...</p>;
  if (!resumo) return null;

  return (
    <div className="space-y-10">
      {/* Restaurante */}
      <div className="border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 bg-ink-soft">
          <h2 className="font-display text-xl">Restaurante & Bar</h2>
          <Link
            href="/admin/menu"
            className="inline-flex items-center gap-1 text-xs text-gold hover:text-white transition-colors"
          >
            Gerir <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
          <Stat label="Categorias" value={resumo.restaurante.categorias} />
          <Stat label="Produtos no menu" value={resumo.restaurante.produtos} />
          <Stat label="Combos" value={resumo.restaurante.combos} />
          <Stat
            label="Reservas pendentes"
            value={resumo.restaurante.reservasPendentes}
            destaque={resumo.restaurante.reservasPendentes > 0}
          />
        </div>
      </div>

      {/* Lojas */}
      <div className="grid md:grid-cols-2 gap-6">
        {resumo.lojas.map((loja) => (
          <div key={loja.slug} className="border border-white/10">
            <div className="flex items-center justify-between px-6 py-4 bg-ink-soft">
              <h2 className="font-display text-xl">{loja.nome}</h2>
              <Link
                href={`/admin/lojas/${loja.slug}`}
                className="inline-flex items-center gap-1 text-xs text-gold hover:text-white transition-colors"
              >
                Gerir <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-px bg-white/5">
              <Stat label="Produtos" value={loja.totalProdutos} />
              <Stat label="Disponíveis" value={loja.produtosDisponiveis} />
              <Stat
                label="Localização"
                value={loja.localizacaoDefinida ? "Definida" : "Pendente"}
                destaque={!loja.localizacaoDefinida}
                textual
              />
            </div>
          </div>
        ))}
      </div>

      {/* Outros */}
      <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/10 max-w-md">
        <Stat label="Eventos publicados" value={resumo.eventos} />
        <Stat
          label="Mensagens não lidas"
          value={resumo.mensagensNaoLidas}
          destaque={resumo.mensagensNaoLidas > 0}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  destaque,
  textual,
}: {
  label: string;
  value: number | string;
  destaque?: boolean;
  textual?: boolean;
}) {
  return (
    <div className="bg-ink p-5">
      <p
        className={`font-display ${textual ? "text-lg" : "text-3xl"} ${destaque ? "text-gold" : "text-paper"}`}
      >
        {value}
      </p>
      <p className="text-mist text-xs uppercase tracking-wide mt-1">
        {label}
      </p>
    </div>
  );
}
