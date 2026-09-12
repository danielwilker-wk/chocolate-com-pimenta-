"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { ChevronRight, ChevronDown, Package, Wallet, CreditCard } from "lucide-react";

type PedidoItem = {
  id: string;
  nome_produto: string;
  preco_unitario: number;
  quantidade: number;
};

type PedidoArquivado = {
  id: string;
  numero_mesa: string;
  nome_cliente: string;
  forma_pagamento: "dinheiro" | "multicaixa";
  observacoes: string | null;
  estado: string;
  total: number;
  criado_em: string;
  pedido_itens?: PedidoItem[];
};

type NoDia = {
  chave: string; // YYYY-MM-DD
  label: string;
  pedidos: PedidoArquivado[];
  total: number;
};

type NoSemana = {
  chave: string; // ano-numeroSemana
  label: string;
  dias: NoDia[];
  total: number;
};

type NoMes = {
  chave: string; // YYYY-MM
  label: string;
  semanas: NoSemana[];
  total: number;
};

/** Devolve o número da semana do mês (1ª, 2ª, 3ª...) para uma data. */
function semanaDoMes(data: Date): number {
  const diaDoMes = data.getDate();
  return Math.ceil(diaDoMes / 7);
}

function agruparPorMesSemanaDia(pedidos: PedidoArquivado[]): NoMes[] {
  const meses = new Map<string, NoMes>();

  for (const pedido of pedidos) {
    const data = new Date(pedido.criado_em);
    const chaveMes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    const labelMes = data.toLocaleDateString("pt-PT", {
      month: "long",
      year: "numeric",
    });

    const numSemana = semanaDoMes(data);
    const chaveSemana = `${chaveMes}-s${numSemana}`;
    const labelSemana = `${numSemana}ª semana de ${data.toLocaleDateString("pt-PT", { month: "long" })}`;

    const chaveDia = data.toISOString().slice(0, 10);
    const labelDia = data.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });

    if (!meses.has(chaveMes)) {
      meses.set(chaveMes, { chave: chaveMes, label: labelMes, semanas: [], total: 0 });
    }
    const mes = meses.get(chaveMes)!;

    let semana = mes.semanas.find((s) => s.chave === chaveSemana);
    if (!semana) {
      semana = { chave: chaveSemana, label: labelSemana, dias: [], total: 0 };
      mes.semanas.push(semana);
    }

    let dia = semana.dias.find((d) => d.chave === chaveDia);
    if (!dia) {
      dia = { chave: chaveDia, label: labelDia, pedidos: [], total: 0 };
      semana.dias.push(dia);
    }

    dia.pedidos.push(pedido);
    dia.total += pedido.total;
    semana.total += pedido.total;
    mes.total += pedido.total;
  }

  // Ordena tudo do mais recente para o mais antigo
  const mesesOrdenados = Array.from(meses.values()).sort((a, b) =>
    b.chave.localeCompare(a.chave)
  );
  for (const mes of mesesOrdenados) {
    mes.semanas.sort((a, b) => b.chave.localeCompare(a.chave));
    for (const semana of mes.semanas) {
      semana.dias.sort((a, b) => b.chave.localeCompare(a.chave));
    }
  }

  return mesesOrdenados;
}

export default function ArquivoPedidos() {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<PedidoArquivado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesesAbertos, setMesesAbertos] = useState<Set<string>>(new Set());
  const [semanasAbertas, setSemanasAbertas] = useState<Set<string>>(new Set());
  const [diasAbertos, setDiasAbertos] = useState<Set<string>>(new Set());

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("pedidos")
      .select("*, pedido_itens(id, nome_produto, preco_unitario, quantidade)")
      .eq("arquivado", true)
      .order("criado_em", { ascending: false });
    setPedidos((data as PedidoArquivado[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function alternar(set: Set<string>, setFn: (s: Set<string>) => void, chave: string) {
    const novo = new Set(set);
    if (novo.has(chave)) {
      novo.delete(chave);
    } else {
      novo.add(chave);
    }
    setFn(novo);
  }

  if (loading) return <p className="text-mist">A carregar...</p>;

  const meses = agruparPorMesSemanaDia(pedidos);

  if (meses.length === 0) {
    return (
      <p className="text-mist">
        Ainda não há pedidos arquivados. Os pedidos são arquivados
        automaticamente todos os dias, à meia-noite.
      </p>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {meses.map((mes) => {
        const mesAberto = mesesAbertos.has(mes.chave);
        return (
          <div key={mes.chave} className="border border-white/10">
            <button
              onClick={() =>
                alternar(mesesAbertos, setMesesAbertos, mes.chave)
              }
              className="w-full flex items-center justify-between px-5 py-4 bg-ink-soft"
            >
              <span className="flex items-center gap-3 font-display text-lg capitalize">
                {mesAberto ? (
                  <ChevronDown size={18} className="text-gold" />
                ) : (
                  <ChevronRight size={18} className="text-gold" />
                )}
                {mes.label}
              </span>
              <span className="text-gold text-sm">
                {mes.total.toLocaleString("pt-PT")} Kz
              </span>
            </button>

            {mesAberto && (
              <div className="px-5 py-3 space-y-2">
                {mes.semanas.map((semana) => {
                  const semanaAberta = semanasAbertas.has(semana.chave);
                  return (
                    <div key={semana.chave} className="border-l-2 border-white/10 pl-4">
                      <button
                        onClick={() =>
                          alternar(semanasAbertas, setSemanasAbertas, semana.chave)
                        }
                        className="w-full flex items-center justify-between py-2.5"
                      >
                        <span className="flex items-center gap-2 text-sm capitalize">
                          {semanaAberta ? (
                            <ChevronDown size={15} className="text-mist" />
                          ) : (
                            <ChevronRight size={15} className="text-mist" />
                          )}
                          {semana.label}
                        </span>
                        <span className="text-mist text-xs">
                          {semana.total.toLocaleString("pt-PT")} Kz
                        </span>
                      </button>

                      {semanaAberta && (
                        <div className="space-y-1.5 pb-2">
                          {semana.dias.map((dia) => {
                            const diaAberto = diasAbertos.has(dia.chave);
                            return (
                              <div key={dia.chave} className="border-l-2 border-white/5 pl-4">
                                <button
                                  onClick={() =>
                                    alternar(diasAbertos, setDiasAbertos, dia.chave)
                                  }
                                  className="w-full flex items-center justify-between py-2"
                                >
                                  <span className="flex items-center gap-2 text-xs capitalize text-mist">
                                    {diaAberto ? (
                                      <ChevronDown size={13} />
                                    ) : (
                                      <ChevronRight size={13} />
                                    )}
                                    {dia.label} · {dia.pedidos.length}{" "}
                                    {dia.pedidos.length === 1 ? "pedido" : "pedidos"}
                                  </span>
                                  <span className="text-gold text-xs">
                                    {dia.total.toLocaleString("pt-PT")} Kz
                                  </span>
                                </button>

                                {diaAberto && (
                                  <div className="space-y-2 pb-3 pl-5">
                                    {dia.pedidos.map((pedido) => (
                                      <div
                                        key={pedido.id}
                                        className="border border-white/10 p-3 text-sm"
                                      >
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="flex items-center gap-2">
                                            <Package size={13} className="text-gold" />
                                            Mesa {pedido.numero_mesa} —{" "}
                                            {pedido.nome_cliente}
                                          </span>
                                          <span className="text-gold">
                                            {pedido.total.toLocaleString("pt-PT")} Kz
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-mist text-xs mb-1.5">
                                          {pedido.forma_pagamento === "dinheiro" ? (
                                            <Wallet size={11} />
                                          ) : (
                                            <CreditCard size={11} />
                                          )}
                                          {pedido.forma_pagamento === "dinheiro"
                                            ? "Dinheiro"
                                            : "Multicaixa"}
                                          <span className="mx-1">·</span>
                                          {new Date(pedido.criado_em).toLocaleTimeString(
                                            "pt-PT",
                                            { hour: "2-digit", minute: "2-digit" }
                                          )}
                                          <span className="mx-1">·</span>
                                          {pedido.estado}
                                        </div>
                                        <ul className="text-mist text-xs space-y-0.5">
                                          {pedido.pedido_itens?.map((item) => (
                                            <li key={item.id}>
                                              {item.quantidade}x {item.nome_produto}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
