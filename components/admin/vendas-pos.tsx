"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser-client";
import { X, Check, ShoppingCart, ClipboardList } from "lucide-react";

type Area = "bar" | "restaurante";
type FormaPagamento = "dinheiro" | "multicaixa";

type ItemVendavel = {
  id: string;
  nome: string;
  unidade: string;
  quantidade_atual: number;
  preco_venda_bar: number | null;
  preco_venda_restaurante: number | null;
  controla_stock: boolean;
};

type Venda = {
  id: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  forma_pagamento: FormaPagamento;
  area: Area;
  criado_em: string;
  estoque_itens: { nome: string } | null;
};

type PedidoParaConverter = {
  id: string;
  numero_mesa: string;
  nome_cliente: string;
  forma_pagamento: FormaPagamento;
  pedido_itens: { nome_produto: string; quantidade: number }[];
};

const AREA_LABEL: Record<Area, string> = {
  bar: "Bar",
  restaurante: "Restaurante",
};

const PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  multicaixa: "Multicaixa",
};

// A leitura do URL (?pedido=) usa useSearchParams, que em Next.js exige uma
// fronteira Suspense — este wrapper existe só para isso; a lógica real
// mantém-se toda em VendasPOSConteudo.
export default function VendasPOS() {
  return (
    <Suspense fallback={<p className="text-mist">A carregar...</p>}>
      <VendasPOSConteudo />
    </Suspense>
  );
}

function VendasPOSConteudo() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const pedidoIdParam = searchParams.get("pedido");

  const [itens, setItens] = useState<ItemVendavel[]>([]);
  const [vendasHoje, setVendasHoje] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [area, setArea] = useState<Area>("bar");
  const [itemSelecionado, setItemSelecionado] = useState<ItemVendavel | null>(
    null
  );
  const [responsavelId, setResponsavelId] = useState<string | null>(null);
  const [pedidoAConverter, setPedidoAConverter] =
    useState<PedidoParaConverter | null>(null);

  const carregarTudo = useCallback(async () => {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const [itensRes, vendasRes, userRes] = await Promise.all([
      supabase
        .from("estoque_itens")
        .select(
          "id, nome, unidade, quantidade_atual, preco_venda_bar, preco_venda_restaurante, controla_stock"
        )
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("vendas")
        .select(
          "id, quantidade, preco_unitario, preco_total, forma_pagamento, area, criado_em, estoque_itens(nome)"
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
    () =>
      itens.filter((i) =>
        area === "bar" ? i.preco_venda_bar !== null : i.preco_venda_restaurante !== null
      ),
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

      <PedidosParaConverter
        autoAbrirId={pedidoIdParam}
        onEscolher={(p) => setPedidoAConverter(p)}
      />

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
            Ainda não há produtos vendáveis nesta área. Define um preço para{" "}
            {AREA_LABEL[area].toLowerCase()} em Stock.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {itensDaArea.map((item) => {
              const preco =
                area === "bar" ? item.preco_venda_bar : item.preco_venda_restaurante;
              return (
                <button
                  key={item.id}
                  onClick={() => setItemSelecionado(item)}
                  disabled={item.controla_stock && item.quantidade_atual <= 0}
                  className="border border-white/10 hover:border-gold p-4 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <p className="font-medium truncate">{item.nome}</p>
                  <p className="text-gold text-sm mt-1">
                    {preco ? `${preco.toLocaleString("pt-PT")} Kz` : "sem preço"}
                  </p>
                  <p className="text-mist text-xs mt-1">
                    {item.controla_stock
                      ? `${item.quantidade_atual} ${item.unidade} em stock`
                      : "Feito na hora"}
                  </p>
                </button>
              );
            })}
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
                  <span className="ml-2 text-[10px] uppercase text-mist">
                    {AREA_LABEL[v.area]}
                  </span>
                  <span className="ml-2 text-[10px] uppercase text-gold border border-gold/30 px-1.5 py-0.5">
                    {PAGAMENTO_LABEL[v.forma_pagamento]}
                  </span>
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
          area={area}
          responsavelId={responsavelId}
          onCancel={() => setItemSelecionado(null)}
          onConcluida={() => {
            setItemSelecionado(null);
            carregarTudo();
          }}
        />
      )}

      {pedidoAConverter && (
        <ModalConverterPedido
          pedido={pedidoAConverter}
          itensDisponiveis={itens}
          responsavelId={responsavelId}
          onCancel={() => setPedidoAConverter(null)}
          onConcluida={() => {
            setPedidoAConverter(null);
            carregarTudo();
          }}
        />
      )}
    </div>
  );
}

/**
 * Lista pedidos das mesas (pendentes ou confirmados) que ainda não foram
 * registados como venda, para o staff poder abri-los diretamente aqui.
 * Se autoAbrirId vier preenchido (vindo de ?pedido= no URL, geralmente por
 * ter clicado "Registar venda" na página de Pedidos), abre esse automaticamente.
 */
function PedidosParaConverter({
  autoAbrirId,
  onEscolher,
}: {
  autoAbrirId?: string | null;
  onEscolher: (pedido: PedidoParaConverter) => void;
}) {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<PedidoParaConverter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("pedidos")
        .select(
          "id, numero_mesa, nome_cliente, forma_pagamento, pedido_itens(nome_produto, quantidade)"
        )
        .in("estado", ["pendente", "confirmado"])
        .eq("arquivado", false)
        .order("criado_em", { ascending: false });
      const lista = (data as unknown as PedidoParaConverter[]) ?? [];
      setPedidos(lista);
      setLoading(false);

      if (autoAbrirId) {
        const encontrado = lista.find((p) => p.id === autoAbrirId);
        if (encontrado) onEscolher(encontrado);
      }
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, autoAbrirId]);

  if (loading || pedidos.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={18} className="text-gold" />
        <h2 className="font-display text-xl">Pedidos das mesas por registar</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pedidos.map((pedido) => (
          <button
            key={pedido.id}
            onClick={() => onEscolher(pedido)}
            className="border border-gold/30 hover:border-gold p-4 text-left transition-colors"
          >
            <p className="font-display">
              Mesa {pedido.numero_mesa} — {pedido.nome_cliente}
            </p>
            <p className="text-mist text-xs mt-1">
              {pedido.pedido_itens.length}{" "}
              {pedido.pedido_itens.length === 1 ? "item" : "itens"}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * Modal para converter um pedido de mesa numa venda real no PDV: liga cada
 * item do pedido a um item de stock (por nome), pergunta a área, e regista
 * a venda descontando o stock — depois marca o pedido como entregue.
 */
function ModalConverterPedido({
  pedido,
  itensDisponiveis,
  responsavelId,
  onCancel,
  onConcluida,
}: {
  pedido: PedidoParaConverter;
  itensDisponiveis: ItemVendavel[];
  responsavelId: string | null;
  onCancel: () => void;
  onConcluida: () => void;
}) {
  const supabase = createClient();
  const [area, setArea] = useState<Area>("restaurante");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  const linhas = pedido.pedido_itens.map((li) => {
    const itemStock = itensDisponiveis.find(
      (i) => i.nome.toLowerCase() === li.nome_produto.toLowerCase()
    );
    const preco = itemStock
      ? area === "bar"
        ? itemStock.preco_venda_bar
        : itemStock.preco_venda_restaurante
      : null;
    return { ...li, itemStock, preco };
  });

  const semCorrespondencia = linhas.filter((l) => !l.itemStock);
  const total = linhas.reduce(
    (soma, l) => soma + (l.preco ?? 0) * l.quantidade,
    0
  );

  async function confirmar() {
    setGuardando(true);
    setErro("");

    const linhasValidas = linhas.filter((l) => l.itemStock && l.preco !== null);

    if (linhasValidas.length > 0) {
      const { error: erroVendas } = await supabase.from("vendas").insert(
        linhasValidas.map((l) => ({
          item_id: l.itemStock!.id,
          area,
          quantidade: l.quantidade,
          preco_unitario: l.preco!,
          preco_total: l.preco! * l.quantidade,
          forma_pagamento: pedido.forma_pagamento,
          valor_pago: l.preco! * l.quantidade,
          troco: 0,
          responsavel_id: responsavelId,
        }))
      );

      if (erroVendas) {
        setErro("Não foi possível registar a venda.");
        setGuardando(false);
        return;
      }
    }

    await supabase
      .from("pedidos")
      .update({ estado: "entregue" })
      .eq("id", pedido.id);

    setGuardando(false);
    onConcluida();
  }

  return (
    <div className="fixed inset-0 bg-ink/90 flex items-center justify-center p-6 z-50">
      <div className="bg-ink-soft border border-gold/30 max-w-md w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">
            Mesa {pedido.numero_mesa} — {pedido.nome_cliente}
          </h3>
          <button onClick={onCancel} className="text-mist hover:text-paper">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="text-mist text-xs uppercase tracking-wide mb-1 block">
            Registar venda em
          </label>
          <div className="flex gap-1">
            {(["bar", "restaurante"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`flex-1 px-3 py-2 text-xs uppercase border ${
                  area === a
                    ? "bg-gold text-ink border-gold font-semibold"
                    : "border-white/15 text-mist hover:text-paper"
                }`}
              >
                {AREA_LABEL[a]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          {linhas.map((l, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className={!l.itemStock ? "text-red-400" : ""}>
                {l.quantidade}x {l.nome_produto}
                {!l.itemStock && " (sem item de stock correspondente)"}
              </span>
              <span className="text-gold">
                {l.preco ? `${(l.preco * l.quantidade).toLocaleString("pt-PT")} Kz` : "—"}
              </span>
            </div>
          ))}
        </div>

        {semCorrespondencia.length > 0 && (
          <p className="text-red-400 text-xs">
            {semCorrespondencia.length}{" "}
            {semCorrespondencia.length === 1 ? "item não foi" : "itens não foram"}{" "}
            encontrados no stock com este nome exato e não serão descontados.
            Podes ajustar o stock manualmente depois.
          </p>
        )}

        <div className="flex items-center justify-between text-base font-medium border-t border-white/10 pt-3">
          <span>Total a registar</span>
          <span className="text-gold">{total.toLocaleString("pt-PT")} Kz</span>
        </div>

        <p className="text-mist text-xs">
          Pagamento: {PAGAMENTO_LABEL[pedido.forma_pagamento]}
        </p>

        {erro && <p className="text-red-400 text-xs">{erro}</p>}

        <div className="flex gap-2 pt-2">
          <button
            onClick={confirmar}
            disabled={guardando}
            className="flex-1 inline-flex items-center justify-center gap-1 bg-gold text-ink px-4 py-2.5 text-xs uppercase font-semibold disabled:opacity-60"
          >
            <Check size={14} />{" "}
            {guardando ? "A registar..." : "Registar venda e marcar entregue"}
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

function ModalVenda({
  item,
  area,
  responsavelId,
  onCancel,
  onConcluida,
}: {
  item: ItemVendavel;
  area: Area;
  responsavelId: string | null;
  onCancel: () => void;
  onConcluida: () => void;
}) {
  const supabase = createClient();
  const [quantidade, setQuantidade] = useState("1");
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("dinheiro");
  const [valorPago, setValorPago] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  const precoUnitario =
    (area === "bar" ? item.preco_venda_bar : item.preco_venda_restaurante) ?? 0;
  const qtd = Number(quantidade) || 0;
  const precoTotal = precoUnitario * qtd;
  const pago =
    formaPagamento === "multicaixa"
      ? precoTotal
      : valorPago === ""
        ? precoTotal
        : Number(valorPago);
  const troco = pago - precoTotal;

  async function confirmar() {
    if (!qtd || qtd <= 0) {
      setErro("Indica uma quantidade válida.");
      return;
    }
    if (item.controla_stock && qtd > item.quantidade_atual) {
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
      area,
      quantidade: qtd,
      preco_unitario: precoUnitario,
      preco_total: precoTotal,
      forma_pagamento: formaPagamento,
      valor_pago: pago,
      troco: formaPagamento === "multicaixa" ? 0 : troco,
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

        <p className="text-mist text-xs uppercase tracking-wide">
          A vender em: <span className="text-gold">{AREA_LABEL[area]}</span>
        </p>

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

        <div>
          <label className="text-mist text-xs uppercase tracking-wide mb-1 block">
            Método de pagamento
          </label>
          <div className="flex gap-1">
            {(["dinheiro", "multicaixa"] as const).map((fp) => (
              <button
                key={fp}
                onClick={() => setFormaPagamento(fp)}
                className={`flex-1 px-3 py-2 text-xs uppercase border ${
                  formaPagamento === fp
                    ? "bg-gold text-ink border-gold font-semibold"
                    : "border-white/15 text-mist hover:text-paper"
                }`}
              >
                {PAGAMENTO_LABEL[fp]}
              </button>
            ))}
          </div>
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

        {formaPagamento === "dinheiro" && (
          <>
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
          </>
        )}

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
