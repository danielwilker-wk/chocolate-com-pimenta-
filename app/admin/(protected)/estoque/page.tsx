import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import EstoqueManager from "@/components/admin/estoque-manager";

export const metadata = { title: "Gerir Stock" };

export default async function AdminEstoquePage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).estoque) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante & Bar
      </p>
      <h1 className="font-display text-3xl mb-8">Gestão de Stock</h1>
      <EstoqueManager />
    </div>
  );
}
