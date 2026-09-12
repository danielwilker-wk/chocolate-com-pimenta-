"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Check, Clock, Bell, X, User, CreditCard, Wallet } from "lucide-react";

type EstadoPedido = "pendente" | "confirmado" | "entregue" | "cancelado";

type PedidoItem = {
  id: string;
  nome_produto: string;
  preco_unitario: number;
  quantidade: number;
};

type Pedido = {
  id: string;
  numero_mesa: string;
  nome_cliente: string;
  forma_pagamento: "dinheiro" | "multicaixa";
  observacoes: string | null;
  estado: EstadoPedido;
  total: number;
  criado_em: string;
  pedido_itens?: PedidoItem[];
};

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const ESTADO_COR: Record<EstadoPedido, string> = {
  pendente: "border-gold text-gold bg-gold/10",
  confirmado: "border-blue-400 text-blue-400 bg-blue-400/10",
  entregue: "border-green-400 text-green-400 bg-green-400/10",
  cancelado: "border-white/20 text-mist",
};

/**
 * Toca um beep simples de notificação usando a Web Audio API,
 * sem precisar de nenhum ficheiro de som externo.
 */
function tocarSom() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // Se o navegador bloquear áudio automático, ignoramos silenciosamente.
  }
}

export default function PedidosManager() {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"ativos" | "todos">("ativos");
  const [novoPedidoAlerta, setNovoPedidoAlerta] = useState(false);
  const somAtivoRef = useRef(true);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("pedidos")
      .select("*, pedido_itens(id, nome_produto, preco_unitario, quantidade)")
      .eq("arquivado", false)
      .order("criado_em", { ascending: false });
    setPedidos((data as Pedido[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Subscrição em tempo real: quando chega um pedido novo, recarrega a
  // lista e dispara o alerta sonoro/visual.
  useEffect(() => {
    const canal = supabase
      .channel("pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pedidos" },
        () => {
          carregar();
          if (somAtivoRef.current) tocarSom();
          setNovoPedidoAlerta(true);
          setTimeout(() => setNovoPedidoAlerta(false), 4000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase, carregar]);

  async function mudarEstado(id: string, estado: EstadoPedido) {
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    carregar();
  }

  if (loading) return <p className="text-mist">A carregar...</p>;

  const visiveis =
    filtro === "ativos"
      ? pedidos.filter((p) => p.estado === "pendente" || p.estado === "confirmado")
      : pedidos;

  return (
    <div>
      {novoPedidoAlerta && (
        <div className="fixed top-24 right-6 z-50 bg-gold text-ink px-5 py-3 flex items-center gap-2 shadow-lg animate-pulse">
          <Bell size={16} />
          <span className="text-sm font-semibold">Novo pedido recebido!</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex gap-2">
          {(["ativos", "todos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 text-xs uppercase tracking-wide border transition-colors ${
                filtro === f
                  ? "bg-gold text-ink border-gold font-semibold"
                  : "border-white/15 text-mist hover:text-paper"
              }`}
            >
              {f === "ativos" ? "Ativos" : "Todos"}
            </button>
          ))}
        </div>
        <button
          onClick={() => (somAtivoRef.current = !somAtivoRef.current)}
          className="text-xs text-mist hover:text-gold transition-colors"
        >
          Som de alerta: clique para alternar
        </button>
      </div>

      {visiveis.length === 0 ? (
        <p className="text-mist">Nenhum pedido encontrado.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl">
          {visiveis.map((pedido) => (
            <div
              key={pedido.id}
              className={`border p-5 ${pedido.estado === "pendente" ? "border-gold/50" : "border-white/10"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-display text-xl">
                    Mesa {pedido.numero_mesa}
                  </p>
                  <p className="text-mist text-sm flex items-center gap-1.5 mt-1">
                    <User size={13} /> {pedido.nome_cliente}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase px-2.5 py-1 border shrink-0 ${ESTADO_COR[pedido.estado]}`}
                >
                  {ESTADO_LABEL[pedido.estado]}
                </span>
              </div>

              <div className="space-y-1.5 mb-3 border-t border-white/5 pt-3">
                {pedido.pedido_itens?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-mist"
                  >
                    <span>
                      {item.quantidade}x {item.nome_produto}
                    </span>
                    <span>
                      {(item.preco_unitario * item.quantidade).toLocaleString(
                        "pt-PT"
                      )}{" "}
                      Kz
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm border-t border-white/5 pt-3 mb-3">
                <span className="flex items-center gap-1.5 text-mist">
                  {pedido.forma_pagamento === "dinheiro" ? (
                    <Wallet size={14} />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  {pedido.forma_pagamento === "dinheiro"
                    ? "Dinheiro"
                    : "Multicaixa"}
                </span>
                <span className="text-gold font-display text-lg">
                  {pedido.total.toLocaleString("pt-PT")} Kz
                </span>
              </div>

              {pedido.observacoes && (
                <p className="text-mist text-xs italic mb-3">
                  &ldquo;{pedido.observacoes}&rdquo;
                </p>
              )}

              <p className="text-mist text-xs flex items-center gap-1.5 mb-4">
                <Clock size={12} />
                {new Date(pedido.criado_em).toLocaleTimeString("pt-PT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="flex gap-2">
                {pedido.estado === "pendente" && (
                  <button
                    onClick={() => mudarEstado(pedido.id, "confirmado")}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase border border-blue-400/40 text-blue-400 px-3 py-2 hover:bg-blue-400 hover:text-ink transition-colors"
                  >
                    <Check size={12} /> Confirmar
                  </button>
                )}
                {pedido.estado === "confirmado" && (
                  <button
                    onClick={() => mudarEstado(pedido.id, "entregue")}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase border border-green-400/40 text-green-400 px-3 py-2 hover:bg-green-400 hover:text-ink transition-colors"
                  >
                    <Check size={12} /> Marcar entregue
                  </button>
                )}
                {(pedido.estado === "pendente" ||
                  pedido.estado === "confirmado") && (
                  <button
                    onClick={() => mudarEstado(pedido.id, "cancelado")}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase text-mist px-3 py-2 hover:text-red-400 transition-colors ml-auto"
                  >
                    <X size={12} /> Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
