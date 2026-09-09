import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import VendasPOS from "@/components/admin/vendas-pos";

export const metadata = { title: "Ponto de Venda" };

export default async function AdminVendasPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).vendas) {
    redirect("/admin");
  }
  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante & Bar
      </p>
      <h1 className="font-display text-3xl mb-8">Ponto de Venda</h1>
      <VendasPOS />
    </div>
  );
}
