"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  PackagePlus,
  PackageMinus,
} from "lucide-react";

type Area = "bar" | "restaurante" | null;

type ItemEstoque = {
  id: string;
  nome: string;
  unidade: string;
  categoria: string | null;
  area: Area;
  quantidade_atual: number;
  estoque_minimo: number;
  preco_venda: number | null;
  ativo: boolean;
};

type Movimento = {
  id: string;
  item_id: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string | null;
  criado_em: string;
  estoque_itens: { nome: string } | null;
};

const AREA_LABEL: Record<string, string> = {
  bar: "Bar",
  restaurante: "Restaurante",
};

export default function EstoqueManager() {
  const supabase = createClient();
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aCriar, setACriar] = useState(false);
  const [filtroArea, setFiltroArea] = useState<
    "todos" | "bar" | "restaurante" | "interno"
  >("todos");

  const carregarTudo = useCallback(async () => {
    const [itensRes, movRes] = await Promise.all([
      supabase.from("estoque_itens").select("*").order("nome"),
      supabase
        .from("movimentos_estoque")
        .select(
          "id, item_id, tipo, quantidade, motivo, criado_em, estoque_itens(nome)"
        )
        .order("criado_em", { ascending: false })
        .limit(20),
    ]);

    if (itensRes.error || movRes.error) {
      setErro("Não foi possível carregar os dados. Verifica a tua ligação.");
    } else {
      setItens(itensRes.data ?? []);
      setMovimentos((movRes.data as unknown as Movimento[]) ?? []);
      setErro("");
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  if (loading) {
    return <p className="text-mist">A carregar...</p>;
  }

  const itensFiltrados = itens.filter((item) => {
    if (filtroArea === "todos") return true;
    if (filtroArea === "interno") return !item.area;
    return item.area === filtroArea;
  });

  return (
    <div className="space-y-16">
      {erro && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3">
          {erro}
        </p>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-display text-2xl">Itens de Stock</h2>
          <div className="flex gap-1 text-xs uppercase tracking-wide">
            {(["todos", "bar", "restaurante", "interno"] as const).map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFiltroArea(f)}
                  className={`px-3 py-1.5 border ${
                    filtroArea === f
                      ? "bg-gold text-ink border-gold font-semibold"
                      : "border-white/15 text-mist hover:text-paper"
                  }`}
                >
                  {f === "todos"
                    ? "Todos"
                    : f === "interno"
                      ? "Insumos"
                      : AREA_LABEL[f]}
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-3">
          {itensFiltrados.length === 0 && (
            <p className="text-mist text-sm">Nenhum item nesta categoria.</p>
          )}
          {itensFiltrados.map((item) => (
            <ItemRow key={item.id} item={item} onChange={carregarTudo} />
          ))}

          {aCriar ? (
            <NovoItemForm
              onCancel={() => setACriar(false)}
              onSaved={() => {
                setACriar(false);
                carregarTudo();
              }}
            />
          ) : (
            <button
              onClick={() => setACriar(true)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold hover:text-white transition-colors mt-2"
            >
              <Plus size={14} /> Adicionar item
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-6">Movimentos recentes</h2>
        {movimentos.length === 0 ? (
          <p className="text-mist text-sm">
            Ainda não há movimentos registados.
          </p>
        ) : (
          <div className="space-y-2">
            {movimentos.map((mov) => (
              <div
                key={mov.id}
                className="flex items-center justify-between gap-4 border-b border-white/5 pb-2 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {mov.tipo === "entrada" ? (
                    <PackagePlus size={16} className="text-gold shrink-0" />
                  ) : (
                    <PackageMinus size={16} className="text-mist shrink-0" />
                  )}
                  <span className="truncate">
                    {mov.estoque_itens?.nome ?? "Item removido"}
                    {mov.motivo ? ` — ${mov.motivo}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-mist">
                  <span
                    className={
                      mov.tipo === "entrada" ? "text-gold" : "text-paper"
                    }
                  >
                    {mov.tipo === "entrada" ? "+" : "-"}
                    {mov.quantidade}
                  </span>
                  <span className="text-xs">
                    {new Date(mov.criado_em).toLocaleString("pt-PT", {
                      day: "2-digit",
                      month: "2-digit",
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
    </div>
  );
}

function ItemRow({
  item,
  onChange,
}: {
  item: ItemEstoque;
  onChange: () => void;
}) {
  const supabase = createClient();
  const [editando, setEditando] = useState(false);
  const [movimentando, setMovimentando] = useState<
    "entrada" | "saida" | null
  >(null);

  const [nome, setNome] = useState(item.nome);
  const [unidade, setUnidade] = useState(item.unidade);
  const [categoria, setCategoria] = useState(item.categoria ?? "");
  const [area, setArea] = useState<string>(item.area ?? "");
  const [estoqueMinimo, setEstoqueMinimo] = useState(
    item.estoque_minimo.toString()
  );
  const [precoVenda, setPrecoVenda] = useState(
    item.preco_venda?.toString() ?? ""
  );

  const abaixoDoMinimo = item.quantidade_atual <= item.estoque_minimo;

  async function guardar() {
    await supabase
      .from("estoque_itens")
      .update({
        nome: nome.trim(),
        unidade: unidade.trim(),
        categoria: categoria.trim() || null,
        area: area || null,
        estoque_minimo: Number(estoqueMinimo) || 0,
        preco_venda: precoVenda ? Number(precoVenda) : null,
      })
      .eq("id", item.id);
    setEditando(false);
    onChange();
  }

  async function alternarAtivo() {
    await supabase
      .from("estoque_itens")
      .update({ ativo: !item.ativo })
      .eq("id", item.id);
    onChange();
  }

  async function remover() {
    if (
      !confirm(
        "Remover este item de stock? Isto não remove o histórico de movimentos."
      )
    )
      return;
    await supabase.from("estoque_itens").delete().eq("id", item.id);
    onChange();
  }

  if (movimentando) {
    return (
      <RegistarMovimentoForm
        item={item}
        tipo={movimentando}
        onCancel={() => setMovimentando(null)}
        onSaved={() => {
          setMovimentando(null);
          onChange();
        }}
      />
    );
  }

  if (editando) {
    return (
      <div className="border border-gold/30 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
            placeholder="Nome"
          />
          <input
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
            placeholder="Unidade (kg, l, un...)"
          />
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
            placeholder="Categoria (opcional)"
          />
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="bg-ink border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          >
            <option value="">Insumo interno (não vendável)</option>
            <option value="bar">Bar</option>
            <option value="restaurante">Restaurante</option>
          </select>
          <input
            value={estoqueMinimo}
            onChange={(e) => setEstoqueMinimo(e.target.value)}
            type="number"
            className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
            placeholder="Stock mínimo"
          />
          <input
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            type="number"
            className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
            placeholder="Preço de venda em Kz"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={guardar}
            className="inline-flex items-center gap-1 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold"
          >
            <Check size={14} /> Guardar
          </button>
          <button
            onClick={() => setEditando(false)}
            className="inline-flex items-center gap-1 border border-white/20 px-4 py-2 text-xs uppercase text-mist"
          >
            <X size={14} /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
      <div className="flex items-center gap-3 min-w-0">
        {abaixoDoMinimo && (
          <AlertTriangle
            size={16}
            className="text-red-400 shrink-0"
            aria-label="Stock baixo"
          />
        )}
        <div className="min-w-0">
          <p
            className={`font-medium truncate ${!item.ativo ? "text-mist line-through" : ""}`}
          >
            {item.nome}
            {item.area && (
              <span className="ml-2 text-[10px] uppercase text-gold border border-gold/40 px-1.5 py-0.5">
                {AREA_LABEL[item.area]}
              </span>
            )}
          </p>
          <p className="text-mist text-xs truncate">
            {item.quantidade_atual} {item.unidade} em stock
            {item.categoria ? ` · ${item.categoria}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {item.preco_venda !== null && (
          <span className="text-gold text-sm">
            {item.preco_venda.toLocaleString("pt-PT")} Kz
          </span>
        )}
        <button
          onClick={() => setMovimentando("entrada")}
          aria-label="Registar entrada"
          title="Registar entrada"
          className="text-mist hover:text-gold transition-colors p-1"
        >
          <PackagePlus size={16} />
        </button>
        <button
          onClick={() => setMovimentando("saida")}
          aria-label="Registar saída"
          title="Registar saída"
          className="text-mist hover:text-gold transition-colors p-1"
        >
          <PackageMinus size={16} />
        </button>
        <button
          onClick={alternarAtivo}
          className={`text-[10px] uppercase px-2 py-1 border ${
            item.ativo ? "border-white/20 text-mist" : "border-gold text-gold"
          }`}
        >
          {item.ativo ? "Ativo" : "Inativo"}
        </button>
        <button
          onClick={() => setEditando(true)}
          aria-label="Editar"
          className="text-mist hover:text-gold transition-colors p-1"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={remover}
          aria-label="Remover"
          className="text-mist hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function RegistarMovimentoForm({
  item,
  tipo,
  onCancel,
  onSaved,
}: {
  item: ItemEstoque;
  tipo: "entrada" | "saida";
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState(tipo === "entrada" ? "compra" : "quebra");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar() {
    const qtd = Number(quantidade);
    if (!qtd || qtd <= 0) {
      setErro("Indica uma quantidade válida.");
      return;
    }
    setGuardando(true);
    setErro("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("movimentos_estoque").insert({
      item_id: item.id,
      tipo,
      quantidade: qtd,
      motivo: motivo.trim() || null,
      responsavel_id: user?.id ?? null,
    });
    setGuardando(false);
    if (error) {
      setErro("Não foi possível registar o movimento.");
      return;
    }
    onSaved();
  }

  return (
    <div className="border border-gold/30 p-4 space-y-3">
      <p className="text-sm">
        Registar{" "}
        <span className="text-gold">
          {tipo === "entrada" ? "entrada" : "saída"}
        </span>{" "}
        de <span className="font-medium">{item.nome}</span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        <input
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          type="number"
          autoFocus
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder={`Quantidade (${item.unidade})`}
        />
        <input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Motivo (ex: compra, quebra, ajuste)"
        />
      </div>
      {erro && <p className="text-red-400 text-xs">{erro}</p>}
      <div className="flex gap-2">
        <button
          onClick={confirmar}
          disabled={guardando}
          className="inline-flex items-center gap-1 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> {guardando ? "A guardar..." : "Confirmar"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 border border-white/20 px-4 py-2 text-xs uppercase text-mist"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}

function NovoItemForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("un");
  const [categoria, setCategoria] = useState("");
  const [area, setArea] = useState("");
  const [quantidadeInicial, setQuantidadeInicial] = useState("0");
  const [estoqueMinimo, setEstoqueMinimo] = useState("0");
  const [precoVenda, setPrecoVenda] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar() {
    if (!nome.trim() || !unidade.trim()) {
      setErro("Nome e unidade são obrigatórios.");
      return;
    }
    setGuardando(true);
    setErro("");
    const { error } = await supabase.from("estoque_itens").insert({
      nome: nome.trim(),
      unidade: unidade.trim(),
      categoria: categoria.trim() || null,
      area: area || null,
      quantidade_atual: Number(quantidadeInicial) || 0,
      estoque_minimo: Number(estoqueMinimo) || 0,
      preco_venda: precoVenda ? Number(precoVenda) : null,
    });
    setGuardando(false);
    if (error) {
      setErro("Não foi possível guardar. Tenta novamente.");
      return;
    }
    onSaved();
  }

  return (
    <div className="border border-gold/30 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Nome (ex: Cerveja Cuca 33cl)"
          autoFocus
        />
        <input
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Unidade (un, kg, l...)"
        />
        <input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Categoria (opcional)"
        />
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="bg-ink border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        >
          <option value="">Insumo interno (não vendável)</option>
          <option value="bar">Bar</option>
          <option value="restaurante">Restaurante</option>
        </select>
        <input
          value={quantidadeInicial}
          onChange={(e) => setQuantidadeInicial(e.target.value)}
          type="number"
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Quantidade inicial em stock"
        />
        <input
          value={estoqueMinimo}
          onChange={(e) => setEstoqueMinimo(e.target.value)}
          type="number"
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Stock mínimo (alerta)"
        />
        <input
          value={precoVenda}
          onChange={(e) => setPrecoVenda(e.target.value)}
          type="number"
          className="bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none col-span-2"
          placeholder="Preço de venda em Kz (se for vendável)"
        />
      </div>
      {erro && <p className="text-red-400 text-xs">{erro}</p>}
      <div className="flex gap-2">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center gap-1 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> {guardando ? "A guardar..." : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 border border-white/20 px-4 py-2 text-xs uppercase text-mist"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}
