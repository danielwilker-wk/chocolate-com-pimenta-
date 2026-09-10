"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Lock, Unlock, Check } from "lucide-react";

type Area = "bar" | "restaurante";

type Sessao = {
  id: string;
  area: Area;
  valor_abertura: number;
  aberto_em: string;
  valor_contado_fecho: number | null;
  fechado_em: string | null;
  observacoes: string | null;
};

type VendaResumo = {
  preco_total: number;
  forma_pagamento: "dinheiro" | "multicaixa";
};

const AREA_LABEL: Record<Area, string> = {
  bar: "Bar",
  restaurante: "Restaurante",
};

export default function CaixaManager() {
  const [area, setArea] = useState<Area>("bar");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide">
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
            Caixa — {AREA_LABEL[a]}
          </button>
        ))}
      </div>
      <CaixaDaArea area={area} />
    </div>
  );
}

function CaixaDaArea({ area }: { area: Area }) {
  const supabase = createClient();
  const [sessaoAberta, setSessaoAberta] = useState<Sessao | null>(null);
  const [historico, setHistorico] = useState<Sessao[]>([]);
  const [vendas, setVendas] = useState<VendaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [aFechar, setAFechar] = useState(false);

  const carregar = useCallback(async () => {
    const abertaRes = await supabase
      .from("caixa_sessoes")
      .select("*")
      .eq("area", area)
      .is("fechado_em", null)
      .maybeSingle();

    const historicoRes = await supabase
      .from("caixa_sessoes")
      .select("*")
      .eq("area", area)
      .not("fechado_em", "is", null)
      .order("fechado_em", { ascending: false })
      .limit(10);

    if (abertaRes.error || historicoRes.error) {
      setErro("Não foi possível carregar os dados. Verifica a tua ligação.");
      setLoading(false);
      return;
    }

    setSessaoAberta(abertaRes.data);
    setHistorico(historicoRes.data ?? []);

    if (abertaRes.data) {
      const vendasRes = await supabase
        .from("vendas")
        .select("preco_total, forma_pagamento")
        .eq("area", area)
        .gte("criado_em", abertaRes.data.aberto_em);
      setVendas(vendasRes.data ?? []);
    } else {
      setVendas([]);
    }

    setErro("");
    setLoading(false);
  }, [supabase, area]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const vendasDinheiro = useMemo(
    () =>
      vendas
        .filter((v) => v.forma_pagamento === "dinheiro")
        .reduce((s, v) => s + v.preco_total, 0),
    [vendas]
  );
  const vendasMulticaixa = useMemo(
    () =>
      vendas
        .filter((v) => v.forma_pagamento === "multicaixa")
        .reduce((s, v) => s + v.preco_total, 0),
    [vendas]
  );
  const valorEsperado = (sessaoAberta?.valor_abertura ?? 0) + vendasDinheiro;

  async function abrirCaixa(valorAbertura: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("caixa_sessoes").insert({
      area,
      valor_abertura: valorAbertura,
      aberto_por: user?.id ?? null,
    });
    if (error) {
      setErro("Não foi possível abrir o caixa.");
      return;
    }
    carregar();
  }

  if (loading) {
    return <p className="text-mist">A carregar...</p>;
  }

  return (
    <div className="space-y-12">
      {erro && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3">
          {erro}
        </p>
      )}

      {!sessaoAberta ? (
        <AbrirCaixaForm onAbrir={abrirCaixa} />
      ) : aFechar ? (
        <FecharCaixaForm
          sessao={sessaoAberta}
          valorEsperado={valorEsperado}
          onCancel={() => setAFechar(false)}
          onFechado={() => {
            setAFechar(false);
            carregar();
          }}
        />
      ) : (
        <div className="border border-gold/30 p-6 space-y-4 max-w-md">
          <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-wide">
            <Unlock size={14} /> Caixa aberto
          </div>
          <p className="text-mist text-xs">
            Aberto às{" "}
            {new Date(sessaoAberta.aberto_em).toLocaleString("pt-PT", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <Linha label="Valor de abertura" valor={sessaoAberta.valor_abertura} />
          <Linha label="Vendas em dinheiro" valor={vendasDinheiro} />
          <Linha
            label="Vendas em Multicaixa (à parte, só consulta)"
            valor={vendasMulticaixa}
            sutil
          />
          <div className="border-t border-white/10 pt-3">
            <Linha label="Valor esperado na gaveta" valor={valorEsperado} destaque />
          </div>
          <button
            onClick={() => setAFechar(true)}
            className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2.5 text-xs uppercase font-semibold"
          >
            <Lock size={14} /> Fechar caixa
          </button>
        </div>
      )}

      <section>
        <h2 className="font-display text-2xl mb-6">Histórico de fechos</h2>
        {historico.length === 0 ? (
          <p className="text-mist text-sm">Ainda não há fechos registados.</p>
        ) : (
          <div className="space-y-2">
            {historico.map((s) => {
              const diferenca = (s.valor_contado_fecho ?? 0) - s.valor_abertura;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 border-b border-white/5 pb-2 text-sm"
                >
                  <span className="text-mist">
                    {new Date(s.aberto_em).toLocaleDateString("pt-PT")} ·{" "}
                    {new Date(s.aberto_em).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    →{" "}
                    {s.fechado_em &&
                      new Date(s.fechado_em).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                  <span>
                    Contado:{" "}
                    <span className="text-gold">
                      {(s.valor_contado_fecho ?? 0).toLocaleString("pt-PT")} Kz
                    </span>
                  </span>
                  <span
                    className={
                      diferenca === 0
                        ? "text-mist"
                        : diferenca > 0
                          ? "text-gold"
                          : "text-red-400"
                    }
                  >
                    {diferenca >= 0 ? "+" : ""}
                    {diferenca.toLocaleString("pt-PT")} Kz
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Linha({
  label,
  valor,
  destaque,
  sutil,
}: {
  label: string;
  valor: number;
  destaque?: boolean;
  sutil?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${destaque ? "text-base font-medium" : "text-sm"} ${sutil ? "text-mist" : ""}`}
    >
      <span className={sutil ? "" : "text-mist"}>{label}</span>
      <span className={destaque ? "text-gold" : ""}>
        {valor.toLocaleString("pt-PT")} Kz
      </span>
    </div>
  );
}

function AbrirCaixaForm({
  onAbrir,
}: {
  onAbrir: (valor: number) => Promise<void>;
}) {
  const [valor, setValor] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function confirmar() {
    const v = Number(valor);
    if (!valor || v < 0) {
      setErro("Indica o valor de abertura (pode ser 0).");
      return;
    }
    setGuardando(true);
    await onAbrir(v);
    setGuardando(false);
  }

  return (
    <div className="border border-gold/30 p-6 space-y-3 max-w-md">
      <div className="flex items-center gap-2 text-mist text-xs uppercase tracking-wide">
        <Lock size={14} /> Caixa fechado
      </div>
      <label className="text-mist text-xs uppercase tracking-wide">
        Valor de abertura (fundo de troco)
      </label>
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        type="number"
        autoFocus
        placeholder="ex: 5000"
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
      />
      {erro && <p className="text-red-400 text-xs">{erro}</p>}
      <button
        onClick={confirmar}
        disabled={guardando}
        className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2.5 text-xs uppercase font-semibold disabled:opacity-60"
      >
        <Unlock size={14} /> {guardando ? "A abrir..." : "Abrir caixa"}
      </button>
    </div>
  );
}

function FecharCaixaForm({
  sessao,
  valorEsperado,
  onCancel,
  onFechado,
}: {
  sessao: Sessao;
  valorEsperado: number;
  onCancel: () => void;
  onFechado: () => void;
}) {
  const supabase = createClient();
  const [valorContado, setValorContado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  const contado = Number(valorContado) || 0;
  const diferenca = contado - valorEsperado;

  async function confirmar() {
    if (valorContado === "") {
      setErro("Indica o valor contado na gaveta.");
      return;
    }
    setGuardando(true);
    setErro("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("caixa_sessoes")
      .update({
        valor_contado_fecho: contado,
        fechado_em: new Date().toISOString(),
        fechado_por: user?.id ?? null,
        observacoes: observacoes.trim() || null,
      })
      .eq("id", sessao.id);
    setGuardando(false);
    if (error) {
      setErro("Não foi possível fechar o caixa.");
      return;
    }
    onFechado();
  }

  return (
    <div className="border border-gold/30 p-6 space-y-4 max-w-md">
      <h3 className="font-display text-xl">Fechar caixa</h3>
      <Linha label="Valor esperado" valor={valorEsperado} destaque />
      <div>
        <label className="text-mist text-xs uppercase tracking-wide">
          Valor contado na gaveta
        </label>
        <input
          value={valorContado}
          onChange={(e) => setValorContado(e.target.value)}
          type="number"
          autoFocus
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none mt-1"
        />
      </div>
      {valorContado !== "" && (
        <div className="flex items-center justify-between text-base font-medium border-t border-white/10 pt-3">
          <span>Diferença</span>
          <span
            className={
              diferenca === 0
                ? "text-mist"
                : diferenca > 0
                  ? "text-gold"
                  : "text-red-400"
            }
          >
            {diferenca >= 0 ? "+" : ""}
            {diferenca.toLocaleString("pt-PT")} Kz
          </span>
        </div>
      )}
      <div>
        <label className="text-mist text-xs uppercase tracking-wide">
          Observações (opcional)
        </label>
        <input
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none mt-1"
          placeholder="ex: falta de troco, despesa retirada..."
        />
      </div>
      {erro && <p className="text-red-400 text-xs">{erro}</p>}
      <div className="flex gap-2">
        <button
          onClick={confirmar}
          disabled={guardando}
          className="inline-flex items-center gap-1 bg-gold text-ink px-4 py-2.5 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> {guardando ? "A fechar..." : "Confirmar fecho"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 border border-white/20 px-4 py-2.5 text-xs uppercase text-mist"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
