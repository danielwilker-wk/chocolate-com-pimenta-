"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser-client";
import { LogOut } from "lucide-react";
import type { PapelAdmin } from "@/lib/supabase/admin-roles";
import { areasVisiveis, ROTULO_PAPEL } from "@/lib/supabase/admin-roles";

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

  const links = [
    { href: "/admin", label: "Visão geral", show: true },
    { href: "/admin/vendas", label: "Vendas", show: areas.vendas },
    { href: "/admin/estoque", label: "Stock", show: areas.estoque },
    { href: "/admin/menu", label: "Menu & Combos", show: areas.menu },
    { href: "/admin/reservas", label: "Reservas", show: areas.reservas },
    { href: "/admin/eventos", label: "Eventos", show: areas.eventos },
    { href: "/admin/lojas/loja-01", label: "Loja 01", show: areas.loja01 },
    { href: "/admin/lojas/loja-02", label: "Loja 02", show: areas.loja02 },
    { href: "/admin/lojas", label: "Lojas (geral)", show: areas.lojasGeral },
    {
      href: "/admin/utilizadores",
      label: "Utilizadores",
      show: areas.utilizadores,
    },
    { href: "/admin/mensagens", label: "Mensagens", show: areas.mensagens },
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
      <nav className="flex-1 flex md:flex-col overflow-x-auto md:overflow-visible p-3 md:p-4 gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-gold text-ink font-medium"
                  : "text-mist hover:text-paper hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5 hidden md:block">
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
