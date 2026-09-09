"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Check, Plus, Trash2 } from "lucide-react";
import ImageUpload from "./image-upload";

type Secao = {
  id: string;
  chave: string;
  titulo: string | null;
  corpo: string | null;
};

type ImagemSite = {
  id: string;
  posicao: string;
  url: string;
  legenda: string | null;
  ativa: boolean;
  ordem: number;
};

const SECOES_SOBRE: { chave: string; label: string }[] = [
  { chave: "sobre_historia", label: "A nossa história" },
  { chave: "sobre_valores", label: "Os nossos valores" },
  { chave: "sobre_missao", label: "Missão" },
  { chave: "sobre_visao", label: "Visão" },
];

const POSICOES_IMAGEM: { posicao: string; label: string; descricao: string }[] = [
  {
    posicao: "hero_home",
    label: "Fundo da Home (Hero)",
    descricao: "Imagem principal na primeira secção da homepage.",
  },
  {
    posicao: "sobre_principal",
    label: "Sobre — Imagem principal",
    descricao: "Imagem grande ao lado do texto da história.",
  },
  {
    posicao: "sobre_galeria",
    label: "Sobre — Galeria",
    descricao: "Várias fotos mostradas em grelha na página Sobre.",
  },
];

export default function ConteudoManager() {
  const supabase = createClient();
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [imagens, setImagens] = useState<ImagemSite[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    const [secoesRes, imagensRes] = await Promise.all([
      supabase.from("conteudo_secoes").select("*"),
      supabase.from("imagens_site").select("*").order("ordem"),
    ]);
    setSecoes(secoesRes.data ?? []);
    setImagens(imagensRes.data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) return <p className="text-mist">A carregar...</p>;

  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-display text-2xl mb-2">Página &ldquo;Sobre a marca&rdquo;</h2>
        <p className="text-mist text-sm mb-6 max-w-lg">
          Este texto aparece diretamente na página pública /sobre. Deixa em
          branco qualquer secção que ainda não tenhas pronta — ela
          simplesmente não aparece no site até seres preencher.
        </p>
        <div className="space-y-4 max-w-2xl">
          {SECOES_SOBRE.map((s) => (
            <SecaoEditor
              key={s.chave}
              label={s.label}
              secao={secoes.find((sec) => sec.chave === s.chave)}
              chave={s.chave}
              onSaved={carregar}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl mb-2">Imagens do site</h2>
        <p className="text-mist text-sm mb-6 max-w-lg">
          Controla que fotos aparecem em cada parte do site. Onde há mais de
          uma imagem ativa (como a galeria), todas são mostradas — desativa
          ou remove para trocar por outra.
        </p>
        <div className="space-y-10">
          {POSICOES_IMAGEM.map((p) => (
            <PosicaoImagens
              key={p.posicao}
              posicao={p.posicao}
              label={p.label}
              descricao={p.descricao}
              imagens={imagens.filter((img) => img.posicao === p.posicao)}
              onChange={carregar}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SecaoEditor({
  label,
  secao,
  chave,
  onSaved,
}: {
  label: string;
  secao: Secao | undefined;
  chave: string;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [corpo, setCorpo] = useState(secao?.corpo ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardar() {
    setGuardando(true);
    setGuardado(false);
    await supabase
      .from("conteudo_secoes")
      .update({ corpo: corpo.trim() || null, atualizado_em: new Date().toISOString() })
      .eq("chave", chave);
    setGuardando(false);
    setGuardado(true);
    onSaved();
    setTimeout(() => setGuardado(false), 2000);
  }

  return (
    <div className="border border-white/10 p-5">
      <p className="font-display text-lg mb-3">{label}</p>
      <textarea
        value={corpo}
        onChange={(e) => setCorpo(e.target.value)}
        rows={4}
        placeholder="Ainda não preenchido — não aparece no site até escreveres algo aqui."
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none resize-y"
      />
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> {guardando ? "A guardar..." : "Guardar"}
        </button>
        {guardado && (
          <span className="text-gold text-xs">Guardado com sucesso.</span>
        )}
      </div>
    </div>
  );
}

function PosicaoImagens({
  posicao,
  label,
  descricao,
  imagens,
  onChange,
}: {
  posicao: string;
  label: string;
  descricao: string;
  imagens: ImagemSite[];
  onChange: () => void;
}) {
  const supabase = createClient();
  const [novaUrl, setNovaUrl] = useState<string | null>(null);
  const [adicionando, setAdicionando] = useState(false);

  async function adicionar() {
    if (!novaUrl) return;
    setAdicionando(true);
    await supabase.from("imagens_site").insert({
      posicao,
      url: novaUrl,
      ordem: imagens.length,
    });
    setNovaUrl(null);
    setAdicionando(false);
    onChange();
  }

  async function alternarAtiva(id: string, ativa: boolean) {
    await supabase
      .from("imagens_site")
      .update({ ativa: !ativa })
      .eq("id", id);
    onChange();
  }

  async function remover(id: string) {
    if (!confirm("Remover esta imagem?")) return;
    await supabase.from("imagens_site").delete().eq("id", id);
    onChange();
  }

  return (
    <div>
      <p className="font-display text-lg">{label}</p>
      <p className="text-mist text-xs mb-4">{descricao}</p>

      <div className="flex flex-wrap gap-4 mb-4">
        {imagens.map((img) => (
          <div key={img.id} className="relative w-28">
            <div
              className={`w-28 h-28 border overflow-hidden ${img.ativa ? "border-gold/40" : "border-white/10 opacity-40"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <button
                onClick={() => alternarAtiva(img.id, img.ativa)}
                className={`text-[9px] uppercase px-1.5 py-1 border ${
                  img.ativa
                    ? "border-white/20 text-mist"
                    : "border-gold text-gold"
                }`}
              >
                {img.ativa ? "Ativa" : "Inativa"}
              </button>
              <button
                onClick={() => remover(img.id)}
                aria-label="Remover"
                className="text-mist hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        <div className="w-28">
          <ImageUpload value={novaUrl} onChange={setNovaUrl} label="" />
        </div>
      </div>

      {novaUrl && (
        <button
          onClick={adicionar}
          disabled={adicionando}
          className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Plus size={14} /> {adicionando ? "A adicionar..." : "Adicionar esta foto"}
        </button>
      )}
    </div>
  );
}
