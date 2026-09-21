"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser-client";
import { LogOut, Bell } from "lucide-react";
import type { PapelAdmin } from "@/lib/supabase/admin-roles";
import { areasVisiveis, ROTULO_PAPEL } from "@/lib/supabase/admin-roles";

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

export default function AdminSidebar({
  nome,
  papel,
}: {
  nome: string;
  papel: PapelAdmin;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const areas = areasVisiveis(papel);
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [alerta, setAlerta] = useState(false);
  const somAtivoRef = useRef(true);

  useEffect(() => {
    if (!areas.reservas) return; // só quem gere o restaurante precisa disto
    const supabase = createClient();

    async function contarPendentes() {
      const { count } = await supabase
        .from("pedidos")
        .select("id", { count: "exact", head: true })
        .eq("estado", "pendente")
        .eq("arquivado", false);
      setPedidosPendentes(count ?? 0);
    }

    contarPendentes();

    const canal = supabase
      .channel("sidebar-pedidos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          contarPendentes();
          if (payload.eventType === "INSERT") {
            if (somAtivoRef.current) tocarSom();
            setAlerta(true);
            setTimeout(() => setAlerta(false), 4000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const links = [
    { href: "/admin", label: "Visão geral", show: true, badge: 0 },
    { href: "/admin/vendas", label: "Vendas", show: areas.vendas, badge: 0 },
    { href: "/admin/caixa", label: "Caixa", show: areas.caixa, badge: 0 },
    { href: "/admin/estoque", label: "Stock", show: areas.estoque, badge: 0 },
    { href: "/admin/menu", label: "Menu & Combos", show: areas.menu, badge: 0 },
    {
      href: "/admin/pedidos",
      label: "Pedidos",
      show: areas.reservas,
      badge: pedidosPendentes,
    },
    { href: "/admin/arquivo", label: "Arquivo", show: areas.reservas, badge: 0 },
    { href: "/admin/reservas", label: "Reservas", show: areas.reservas, badge: 0 },
    { href: "/admin/eventos", label: "Eventos", show: areas.eventos, badge: 0 },
    { href: "/admin/lojas/loja-01", label: "Loja 01", show: areas.loja01, badge: 0 },
    { href: "/admin/lojas/loja-02", label: "Loja 02", show: areas.loja02, badge: 0 },
    { href: "/admin/lojas", label: "Lojas (geral)", show: areas.lojasGeral, badge: 0 },
    {
      href: "/admin/conteudo",
      label: "Conteúdo do site",
      show: areas.lojasGeral,
      badge: 0,
    },
    {
      href: "/admin/utilizadores",
      label: "Utilizadores",
      show: areas.utilizadores,
      badge: 0,
    },
    { href: "/admin/mensagens", label: "Mensagens", show: areas.mensagens, badge: 0 },
  ].filter((l) => l.show);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full md:w-64 shrink-0 bg-ink-soft border-r border-white/5 md:min-h-screen flex md:flex-col">
      <div className="p-6 border-b border-white/5 hidden md:block">
        <p className="font-display text-lg tracking-[0.06em]">
          CHOCOLATE <span className="text-gold">COM PIMENTA</span>
        </p>
        <p className="text-mist text-xs mt-1">Painel administrativo</p>
      </div>

      {alerta && (
        <div className="fixed top-6 right-6 z-50 bg-gold text-ink px-5 py-3 flex items-center gap-2 shadow-lg animate-pulse md:top-24">
          <Bell size={16} />
          <span className="text-sm font-semibold">Novo pedido recebido!</span>
        </div>
      )}

      <nav className="flex-1 flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative whitespace-nowrap px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                active
                  ? "bg-gold text-ink font-medium"
                  : "text-mist hover:text-paper hover:bg-white/5"
              }`}
            >
              {link.label}
              {link.badge > 0 && (
                <span
                  className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 ${
                    active ? "bg-ink text-gold" : "bg-gold text-ink"
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 hidden md:block">
        {areas.reservas && (
          <button
            onClick={() => (somAtivoRef.current = !somAtivoRef.current)}
            className="text-xs text-mist hover:text-gold transition-colors mb-4 block"
          >
            Som de alerta de pedidos: clique para alternar
          </button>
        )}
        <p className="text-sm text-paper truncate">{nome}</p>
        <p className="text-xs text-gold mb-4">{ROTULO_PAPEL[papel]}</p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-xs text-mist hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
