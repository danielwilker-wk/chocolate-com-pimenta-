"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import ImageUpload from "./image-upload";

type Loja = {
  id: string;
  slug: string;
  nome: string;
  localizacao: string | null;
  horario: string | null;
  telefone: string | null;
  whatsapp: string | null;
  foto_url: string | null;
};

type Produto = {
  id: string;
  loja_id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  foto_url: string | null;
  disponivel: boolean;
};

export default function LojaManager({ slug }: { slug: string }) {
  const supabase = createClient();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [aCriarProduto, setACriarProduto] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data: lojaData } = await supabase
      .from("lojas")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (lojaData) {
      const { data: produtosData } = await supabase
        .from("produtos")
        .select("*")
        .eq("loja_id", lojaData.id)
        .order("ordem");
      setProdutos(produtosData ?? []);
    }
    setLoja(lojaData);
    setLoading(false);
  }, [supabase, slug]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) return <p className="text-mist">A carregar...</p>;
  if (!loja) return <p className="text-mist">Loja não encontrada.</p>;

  return (
    <div className="space-y-12">
      {/* Informações da loja */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Informações da loja</h2>
          {!editandoInfo && (
            <button
              onClick={() => setEditandoInfo(true)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold hover:text-white transition-colors"
            >
              <Pencil size={14} /> Editar
            </button>
          )}
        </div>

        {editandoInfo ? (
          <LojaInfoForm
            loja={loja}
            onCancel={() => setEditandoInfo(false)}
            onSaved={() => {
              setEditandoInfo(false);
              carregar();
            }}
          />
        ) : (
          <div className="border border-white/10 p-6 max-w-lg space-y-4 text-sm">
            <div className="w-24 h-24 bg-ink border border-white/10 overflow-hidden">
              {loja.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loja.foto_url}
                  alt={loja.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-mist text-[10px] text-center p-2">
                  Sem foto
                </div>
              )}
            </div>
            <InfoLine label="Localização" value={loja.localizacao} />
            <InfoLine label="Horário" value={loja.horario} />
            <InfoLine label="Telefone" value={loja.telefone} />
            <InfoLine label="WhatsApp" value={loja.whatsapp} />
          </div>
        )}
      </section>

      {/* Produtos */}
      <section>
        <h2 className="font-display text-2xl mb-6">Produtos</h2>
        <div className="space-y-3 max-w-2xl">
          {produtos.map((produto) => (
            <ProdutoRow
              key={produto.id}
              produto={produto}
              onChange={carregar}
            />
          ))}

          {aCriarProduto ? (
            <NovoProdutoForm
              lojaId={loja.id}
              onCancel={() => setACriarProduto(false)}
              onSaved={() => {
                setACriarProduto(false);
                carregar();
              }}
            />
          ) : (
            <button
              onClick={() => setACriarProduto(true)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gold hover:text-white transition-colors mt-2"
            >
              <Plus size={14} /> Adicionar produto
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string | null }) {
  return (
    <p>
      <span className="text-mist">{label}: </span>
      <span className={value ? "text-paper" : "text-mist italic"}>
        {value || "não definido"}
      </span>
    </p>
  );
}

function LojaInfoForm({
  loja,
  onCancel,
  onSaved,
}: {
  loja: Loja;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [localizacao, setLocalizacao] = useState(loja.localizacao ?? "");
  const [horario, setHorario] = useState(loja.horario ?? "");
  const [telefone, setTelefone] = useState(loja.telefone ?? "");
  const [whatsapp, setWhatsapp] = useState(loja.whatsapp ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(loja.foto_url);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    await supabase
      .from("lojas")
      .update({
        localizacao: localizacao.trim() || null,
        horario: horario.trim() || null,
        telefone: telefone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        foto_url: fotoUrl,
      })
      .eq("id", loja.id);
    setGuardando(false);
    onSaved();
  }

  return (
    <div className="border border-gold/30 p-6 max-w-lg space-y-4">
      <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto da loja" />
      <Field label="Localização" value={localizacao} onChange={setLocalizacao} />
      <Field
        label="Horário"
        value={horario}
        onChange={setHorario}
        placeholder="Ex: Seg-Sáb, 9h-19h"
      />
      <Field label="Telefone" value={telefone} onChange={setTelefone} />
      <Field
        label="WhatsApp"
        value={whatsapp}
        onChange={setWhatsapp}
        placeholder="Ex: 244976684181"
      />
      <div className="flex gap-2 pt-2">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center gap-2 bg-gold text-ink px-5 py-2.5 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> Guardar
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 text-xs uppercase text-mist"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
      />
    </div>
  );
}

function ProdutoRow({
  produto,
  onChange,
}: {
  produto: Produto;
  onChange: () => void;
}) {
  const supabase = createClient();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(produto.nome);
  const [descricao, setDescricao] = useState(produto.descricao ?? "");
  const [preco, setPreco] = useState(produto.preco?.toString() ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(produto.foto_url);

  async function guardar() {
    await supabase
      .from("produtos")
      .update({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: preco ? Number(preco) : null,
        foto_url: fotoUrl,
      })
      .eq("id", produto.id);
    setEditando(false);
    onChange();
  }

  async function remover() {
    if (!confirm("Remover este produto?")) return;
    await supabase.from("produtos").delete().eq("id", produto.id);
    onChange();
  }

  async function alternarDisponibilidade() {
    await supabase
      .from("produtos")
      .update({ disponivel: !produto.disponivel })
      .eq("id", produto.id);
    onChange();
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
    <div className="flex items-center justify-between gap-4 border border-white/10 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 shrink-0 bg-ink border border-white/10 overflow-hidden">
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
          onClick={alternarDisponibilidade}
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

function NovoProdutoForm({
  lojaId,
  onCancel,
  onSaved,
}: {
  lojaId: string;
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
    const { error } = await supabase.from("produtos").insert({
      loja_id: lojaId,
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
