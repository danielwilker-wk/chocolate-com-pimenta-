"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Plus, Pencil, Trash2, X, Check, ChevronDown } from "lucide-react";
import ImageUpload from "./image-upload";

type Categoria = { id: string; nome: string; ordem: number };
type Produto = {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  foto_url: string | null;
  disponivel: boolean;
  ordem: number;
};
type Combo = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  foto_url: string | null;
  disponivel: boolean;
  ordem: number;
};

export default function MenuManager() {
  const supabase = createClient();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarTudo = useCallback(async () => {
    const [catRes, prodRes, comboRes] = await Promise.all([
      supabase.from("menu_categorias").select("*").order("ordem"),
      supabase.from("menu_produtos").select("*").order("ordem"),
      supabase.from("menu_combos").select("*").order("ordem"),
    ]);

    if (catRes.error || prodRes.error || comboRes.error) {
      setErro("Não foi possível carregar os dados. Verifica a tua ligação.");
    } else {
      setCategorias(catRes.data ?? []);
      setProdutos(prodRes.data ?? []);
      setCombos(comboRes.data ?? []);
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

  return (
    <div className="space-y-16">
      {erro && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3">
          {erro}
        </p>
      )}

      <CategoriasEProdutos
        categorias={categorias}
        produtos={produtos}
        onChange={carregarTudo}
      />

      <CombosManager combos={combos} onChange={carregarTudo} />
    </div>
  );
}

// =============================================================
// CATEGORIAS + PRODUTOS
// =============================================================
function CategoriasEProdutos({
  categorias,
  produtos,
  onChange,
}: {
  categorias: Categoria[];
  produtos: Produto[];
  onChange: () => void;
}) {
  const supabase = createClient();
  const [novaCategoria, setNovaCategoria] = useState("");
  // Guarda o conjunto de categorias expandidas (em vez de só uma), para não
  // fechar tudo sempre que os dados são recarregados.
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  function alternarExpansao(id: string) {
    setExpandidas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  async function adicionarCategoria() {
    const nome = novaCategoria.trim();
    if (!nome) return;
    const { data, error } = await supabase
      .from("menu_categorias")
      .insert({ nome, ordem: categorias.length })
      .select()
      .single();
    if (!error && data) {
      setNovaCategoria("");
      // Abre automaticamente a categoria recém-criada, para o próximo passo
      // (adicionar produtos) ficar óbvio e imediato.
      setExpandidas((prev) => new Set(prev).add(data.id));
      onChange();
    }
  }

  async function removerCategoria(id: string) {
    if (
      !confirm(
        "Remover esta categoria também remove todos os produtos dentro dela. Continuar?"
      )
    )
      return;
    await supabase.from("menu_categorias").delete().eq("id", id);
    onChange();
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-display text-2xl">Menu — Categorias & Produtos</h2>
      </div>

      <div className="flex gap-3 mb-8 max-w-md">
        <input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && adicionarCategoria()}
          placeholder="Nova categoria (ex: Sobremesas)"
          className="flex-1 bg-transparent border border-white/15 focus:border-gold px-4 py-2.5 text-sm outline-none transition-colors"
        />
        <button
          onClick={adicionarCategoria}
          className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2.5 text-xs uppercase tracking-wide font-semibold hover:bg-white transition-colors"
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {categorias.length === 0 && (
        <p className="text-mist text-sm">
          Ainda não há categorias. Adiciona a primeira acima.
        </p>
      )}

      <div className="space-y-4">
        {categorias.map((cat) => {
          const aberta = expandidas.has(cat.id);
          return (
            <div key={cat.id} className="border border-white/10">
              <div className="flex items-center justify-between px-5 py-4 bg-ink-soft">
                <button
                  onClick={() => alternarExpansao(cat.id)}
                  className="font-display text-lg text-left flex-1 flex items-center gap-3"
                >
                  <ChevronDown
                    size={18}
                    className={`text-gold transition-transform duration-200 ${aberta ? "rotate-180" : ""}`}
                  />
                  {cat.nome}
                  <span className="text-mist text-sm font-body">
                    (
                    {produtos.filter((p) => p.categoria_id === cat.id).length}{" "}
                    produtos)
                  </span>
                </button>
                <button
                  onClick={() => removerCategoria(cat.id)}
                  aria-label="Remover categoria"
                  className="text-mist hover:text-red-400 transition-colors p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {aberta && (
                <div className="p-5">
                  <ProdutosDaCategoria
                    categoriaId={cat.id}
                    produtos={produtos.filter(
                      (p) => p.categoria_id === cat.id
                    )}
                    onChange={onChange}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProdutosDaCategoria({
  categoriaId,
  produtos,
  onChange,
}: {
  categoriaId: string;
  produtos: Produto[];
  onChange: () => void;
}) {
  const supabase = createClient();
  const [aCriar, setACriar] = useState(false);

  async function removerProduto(id: string) {
    if (!confirm("Remover este produto do menu?")) return;
    await supabase.from("menu_produtos").delete().eq("id", id);
    onChange();
  }

  async function alternarDisponibilidade(produto: Produto) {
    await supabase
      .from("menu_produtos")
      .update({ disponivel: !produto.disponivel })
      .eq("id", produto.id);
    onChange();
  }

  return (
    <div className="space-y-3">
      {produtos.length === 0 && !aCriar && (
        <p className="text-mist text-sm mb-2">
          Ainda não há produtos nesta categoria.
        </p>
      )}

      {produtos.map((produto) => (
        <ProdutoRow
          key={produto.id}
          produto={produto}
          onSaved={onChange}
          onDelete={() => removerProduto(produto.id)}
          onToggleDisponivel={() => alternarDisponibilidade(produto)}
        />
      ))}

      {aCriar ? (
        <NovoProdutoForm
          categoriaId={categoriaId}
          onCancel={() => setACriar(false)}
          onSaved={() => {
            setACriar(false);
            onChange();
          }}
        />
      ) : (
        <button
          onClick={() => setACriar(true)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold hover:text-white transition-colors mt-2"
        >
          <Plus size={14} /> Adicionar produto
        </button>
      )}
    </div>
  );
}

function ProdutoRow({
  produto,
  onSaved,
  onDelete,
  onToggleDisponivel,
}: {
  produto: Produto;
  onSaved: () => void;
  onDelete: () => void;
  onToggleDisponivel: () => void;
}) {
  const supabase = createClient();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(produto.nome);
  const [descricao, setDescricao] = useState(produto.descricao ?? "");
  const [preco, setPreco] = useState(produto.preco?.toString() ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(produto.foto_url);

  async function guardar() {
    await supabase
      .from("menu_produtos")
      .update({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: preco ? Number(preco) : null,
        foto_url: fotoUrl,
      })
      .eq("id", produto.id);
    setEditando(false);
    onSaved();
  }

  if (editando) {
    return (
      <div className="border border-gold/30 p-4 space-y-3">
        <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto" />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Nome"
        />
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Descrição (opcional)"
        />
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          type="number"
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Preço em Kz"
        />
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
        <div className="w-12 h-12 shrink-0 bg-ink-soft border border-white/10 overflow-hidden">
          {produto.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={produto.foto_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p
            className={`font-medium truncate ${!produto.disponivel ? "text-mist line-through" : ""}`}
          >
            {produto.nome}
          </p>
          {produto.descricao && (
            <p className="text-mist text-xs truncate">{produto.descricao}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-gold text-sm">
          {produto.preco ? `${produto.preco.toLocaleString("pt-PT")} Kz` : "—"}
        </span>
        <button
          onClick={onToggleDisponivel}
          className={`text-[10px] uppercase px-2 py-1 border ${
            produto.disponivel
              ? "border-white/20 text-mist"
              : "border-gold text-gold"
          }`}
        >
          {produto.disponivel ? "Disponível" : "Indisponível"}
        </button>
        <button
          onClick={() => setEditando(true)}
          aria-label="Editar"
          className="text-mist hover:text-gold transition-colors p-1"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Remover"
          className="text-mist hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function NovoProdutoForm({
  categoriaId,
  onCancel,
  onSaved,
}: {
  categoriaId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar() {
    if (!nome.trim()) {
      setErro("O nome do produto é obrigatório.");
      return;
    }
    setGuardando(true);
    setErro("");
    const { error } = await supabase.from("menu_produtos").insert({
      categoria_id: categoriaId,
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco: preco ? Number(preco) : null,
      foto_url: fotoUrl,
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
      <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto" />
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Nome do produto"
        autoFocus
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Descrição (opcional)"
      />
      <input
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        type="number"
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Preço em Kz (opcional)"
      />
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

// =============================================================
// COMBOS
// =============================================================
function CombosManager({
  combos,
  onChange,
}: {
  combos: Combo[];
  onChange: () => void;
}) {
  const supabase = createClient();
  const [aCriar, setACriar] = useState(false);

  async function removerCombo(id: string) {
    if (!confirm("Remover este combo?")) return;
    await supabase.from("menu_combos").delete().eq("id", id);
    onChange();
  }

  async function alternarDisponibilidade(combo: Combo) {
    await supabase
      .from("menu_combos")
      .update({ disponivel: !combo.disponivel })
      .eq("id", combo.id);
    onChange();
  }

  return (
    <section>
      <h2 className="font-display text-2xl mb-6">Combos</h2>

      <div className="space-y-3 max-w-2xl">
        {combos.map((combo) => (
          <ComboRow
            key={combo.id}
            combo={combo}
            onSaved={onChange}
            onDelete={() => removerCombo(combo.id)}
            onToggleDisponivel={() => alternarDisponibilidade(combo)}
          />
        ))}

        {aCriar ? (
          <NovoComboForm
            onCancel={() => setACriar(false)}
            onSaved={() => {
              setACriar(false);
              onChange();
            }}
          />
        ) : (
          <button
            onClick={() => setACriar(true)}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold hover:text-white transition-colors mt-2"
          >
            <Plus size={14} /> Adicionar combo
          </button>
        )}
      </div>
    </section>
  );
}

function ComboRow({
  combo,
  onSaved,
  onDelete,
  onToggleDisponivel,
}: {
  combo: Combo;
  onSaved: () => void;
  onDelete: () => void;
  onToggleDisponivel: () => void;
}) {
  const supabase = createClient();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(combo.nome);
  const [descricao, setDescricao] = useState(combo.descricao ?? "");
  const [preco, setPreco] = useState(combo.preco?.toString() ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(combo.foto_url);

  async function guardar() {
    await supabase
      .from("menu_combos")
      .update({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: preco ? Number(preco) : null,
        foto_url: fotoUrl,
      })
      .eq("id", combo.id);
    setEditando(false);
    onSaved();
  }

  if (editando) {
    return (
      <div className="border border-gold/30 p-4 space-y-3">
        <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto" />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        />
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Descrição (opcional)"
        />
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          type="number"
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Preço em Kz"
        />
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
    <div className="flex items-center justify-between gap-4 border border-white/10 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 shrink-0 bg-ink-soft border border-white/10 overflow-hidden">
          {combo.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={combo.foto_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p
            className={`font-medium truncate ${!combo.disponivel ? "text-mist line-through" : ""}`}
          >
            {combo.nome}
          </p>
          {combo.descricao && (
            <p className="text-mist text-xs truncate">{combo.descricao}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-gold text-sm">
          {combo.preco ? `${combo.preco.toLocaleString("pt-PT")} Kz` : "—"}
        </span>
        <button
          onClick={onToggleDisponivel}
          className={`text-[10px] uppercase px-2 py-1 border ${
            combo.disponivel
              ? "border-white/20 text-mist"
              : "border-gold text-gold"
          }`}
        >
          {combo.disponivel ? "Disponível" : "Indisponível"}
        </button>
        <button
          onClick={() => setEditando(true)}
          aria-label="Editar"
          className="text-mist hover:text-gold transition-colors p-1"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Remover"
          className="text-mist hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function NovoComboForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar() {
    if (!nome.trim()) {
      setErro("O nome do combo é obrigatório.");
      return;
    }
    setGuardando(true);
    setErro("");
    const { error } = await supabase.from("menu_combos").insert({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      preco: preco ? Number(preco) : null,
      foto_url: fotoUrl,
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
      <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto" />
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Nome do combo"
        autoFocus
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Descrição (opcional)"
      />
      <input
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
        type="number"
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Preço em Kz (opcional)"
      />
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
