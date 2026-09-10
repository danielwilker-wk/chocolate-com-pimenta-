import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import CaixaManager from "@/components/admin/caixa-manager";

export const metadata = { title: "Caixa" };

export default async function AdminCaixaPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).caixa) {
    redirect("/admin");
  }
  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante & Bar
      </p>
      <h1 className="font-display text-3xl mb-8">Caixa</h1>
      <CaixaManager />
    </div>
  );
}
