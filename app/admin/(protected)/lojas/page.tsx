import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import OverviewDashboard from "@/components/admin/overview-dashboard";

export const metadata = { title: "Lojas — Visão geral" };

export default async function AdminLojasGeralPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).lojasGeral) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Administração
      </p>
      <h1 className="font-display text-3xl mb-2">Visão geral das lojas</h1>
      <p className="text-mist mb-10 max-w-lg">
        Estado atual do restaurante e de cada loja, com acesso rápido à
        gestão de cada uma.
      </p>
      <OverviewDashboard />
    </div>
  );
}
