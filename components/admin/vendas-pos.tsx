"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { X, Check, ShoppingCart } from "lucide-react";

type Area = "bar" | "restaurante";

type ItemVendavel = {
  id: string;
  nome: string;
  unidade: string;
  area: Area;
  quantidade_atual: number;
  preco_venda: number | null;
};

type Venda = {
  id: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  criado_em: string;
  estoque_itens: { nome: string; area: Area } | null;
};

const AREA_LABEL: Record<Area, string> = {
  bar: "Bar",
  restaurante: "Restaurante",
};

export default function VendasPOS() {
  const supabase = createClient();
  const [itens, setItens] = useState<ItemVendavel[]>([]);
  const [vendasHoje, setVendasHoje] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [area, setArea] = useState<Area>("bar");
  const [itemSelecionado, setItemSelecionado] = useState<ItemVendavel | null>(
    null
  );
  const [responsavelId, setResponsavelId] = useState<string | null>(null);

  const carregarTudo = useCallback(async () => {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const [itensRes, vendasRes, userRes] = await Promise.all([
      supabase
        .from("estoque_itens")
        .select("id, nome, unidade, area, quantidade_atual, preco_venda")
        .not("area", "is", null)
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("vendas")
        .select(
          "id, quantidade, preco_unitario, preco_total, criado_em, estoque_itens(nome, area)"
        )
        .gte("criado_em", inicioDoDia.toISOString())
        .order("criado_em", { ascending: false }),
      supabase.auth.getUser(),
    ]);

    if (itensRes.error || vendasRes.error) {
      setErro("Não foi possível carregar os dados. Verifica a tua ligação.");
    } else {
      setItens((itensRes.data as ItemVendavel[]) ?? []);
      setVendasHoje((vendasRes.data as unknown as Venda[]) ?? []);
      setErro("");
    }
    setResponsavelId(userRes.data.user?.id ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  const itensDaArea = useMemo(
    () => itens.filter((i) => i.area === area),
    [itens, area]
  );

  const totalHoje = useMemo(
    () => vendasHoje.reduce((soma, v) => soma + v.preco_total, 0),
    [vendasHoje]
  );

  if (loading) {
    return <p className="text-mist">A carregar...</p>;
  }

  return (
    <div className="space-y-16">
      {erro && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3">
          {erro}
        </p>
      )}

      <section>
        <div className="flex items-center gap-1 mb-8 text-xs uppercase tracking-wide">
          {(["bar", "restaurante"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setArea(a)}
              className={`px-4 py-2 border ${
                area === a
                  ? "bg-gold text-ink border-gold font-semibold"
                  : "border-white/15 text-mist hover:text-paper"
              }`}
            >
              {AREA_LABEL[a]}
            </button>
          ))}
        </div>

        {itensDaArea.length === 0 ? (
          <p className="text-mist text-sm">
            Ainda não há produtos vendáveis nesta área. Adiciona-os em Stock.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {itensDaArea.map((item) => (
              <button
                key={item.id}
                onClick={() => setItemSelecionado(item)}
                disabled={item.quantidade_atual <= 0}
                className="border border-white/10 hover:border-gold p-4 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <p className="font-medium truncate">{item.nome}</p>
                <p className="text-gold text-sm mt-1">
                  {item.preco_venda
                    ? `${item.preco_venda.toLocaleString("pt-PT")} Kz`
                    : "sem preço"}
                </p>
                <p className="text-mist text-xs mt-1">
                  {item.quantidade_atual} {item.unidade} em stock
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Vendas de hoje</h2>
          <p className="text-gold text-sm">
            Total: {totalHoje.toLocaleString("pt-PT")} Kz ({vendasHoje.length}{" "}
            vendas)
          </p>
        </div>
        {vendasHoje.length === 0 ? (
          <p className="text-mist text-sm">
            Ainda não há vendas registadas hoje.
          </p>
        ) : (
          <div className="space-y-2">
            {vendasHoje.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-4 border-b border-white/5 pb-2 text-sm"
              >
                <span className="truncate">
                  {v.quantidade}x {v.estoque_itens?.nome ?? "Item removido"}
                  {v.estoque_itens?.area && (
                    <span className="ml-2 text-[10px] uppercase text-mist">
                      {AREA_LABEL[v.estoque_itens.area]}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-4 shrink-0 text-mist">
                  <span className="text-gold">
                    {v.preco_total.toLocaleString("pt-PT")} Kz
                  </span>
                  <span className="text-xs">
                    {new Date(v.criado_em).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {itemSelecionado && (
        <ModalVenda
          item={itemSelecionado}
          responsavelId={responsavelId}
          onCancel={() => setItemSelecionado(null)}
          onConcluida={() => {
            setItemSelecionado(null);
            carregarTudo();
          }}
        />
      )}
    </div>
  );
}

function ModalVenda({
  item,
  responsavelId,
  onCancel,
  onConcluida,
}: {
  item: ItemVendavel;
  responsavelId: string | null;
  onCancel: () => void;
  onConcluida: () => void;
}) {
  const supabase = createClient();
  const [quantidade, setQuantidade] = useState("1");
  const [valorPago, setValorPago] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  const precoUnitario = item.preco_venda ?? 0;
  const qtd = Number(quantidade) || 0;
  const precoTotal = precoUnitario * qtd;
  const pago = valorPago === "" ? precoTotal : Number(valorPago);
  const troco = pago - precoTotal;

  async function confirmar() {
    if (!qtd || qtd <= 0) {
      setErro("Indica uma quantidade válida.");
      return;
    }
    if (qtd > item.quantidade_atual) {
      setErro(`Só há ${item.quantidade_atual} ${item.unidade} em stock.`);
      return;
    }
    if (pago < precoTotal) {
      setErro("O valor pago é menor que o total da venda.");
      return;
    }
    setGuardando(true);
    setErro("");
    const { error } = await supabase.from("vendas").insert({
      item_id: item.id,
      area: item.area,
      quantidade: qtd,
      preco_unitario: precoUnitario,
      preco_total: precoTotal,
      valor_pago: pago,
      troco,
      responsavel_id: responsavelId,
    });
    setGuardando(false);
    if (error) {
      setErro("Não foi possível registar a venda.");
      return;
    }
    onConcluida();
  }

  return (
    <div className="fixed inset-0 bg-ink/90 flex items-center justify-center p-6 z-50">
      <div className="bg-ink-soft border border-gold/30 max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl flex items-center gap-2">
            <ShoppingCart size={18} className="text-gold" />
            {item.nome}
          </h3>
          <button onClick={onCancel} className="text-mist hover:text-paper">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="text-mist text-xs uppercase tracking-wide">
            Quantidade
          </label>
          <input
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            type="number"
            min="1"
            autoFocus
            className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none mt-1"
          />
        </div>

        <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
          <span className="text-mist">Preço unitário</span>
          <span>{precoUnitario.toLocaleString("pt-PT")} Kz</span>
        </div>
        <div className="flex items-center justify-between text-base font-medium">
          <span>Total a pagar</span>
          <span className="text-gold">
            {precoTotal.toLocaleString("pt-PT")} Kz
          </span>
        </div>

        <div>
          <label className="text-mist text-xs uppercase tracking-wide">
            Valor entregue pelo cliente
          </label>
          <input
            value={valorPago}
            onChange={(e) => setValorPago(e.target.value)}
            type="number"
            placeholder={precoTotal.toString()}
            className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none mt-1"
          />
        </div>

        <div className="flex items-center justify-between text-base font-medium border-t border-white/10 pt-3">
          <span>Troco a entregar</span>
          <span className={troco < 0 ? "text-red-400" : "text-gold"}>
            {troco.toLocaleString("pt-PT")} Kz
          </span>
        </div>

        {erro && <p className="text-red-400 text-xs">{erro}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={confirmar}
            disabled={guardando}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-gold text-ink px-4 py-2.5 text-xs uppercase font-semibold disabled:opacity-60"
          >
            <Check size={14} /> {guardando ? "A registar..." : "Finalizar venda"}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 border border-white/20 px-4 py-2.5 text-xs uppercase text-mist"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
