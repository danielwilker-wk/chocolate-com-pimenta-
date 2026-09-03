import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import MenuManager from "@/components/admin/menu-manager";

export const metadata = { title: "Gerir Menu & Combos" };

export default async function AdminMenuPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).menu) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante
      </p>
      <h1 className="font-display text-3xl mb-8">Menu & Combos</h1>
      <MenuManager />
    </div>
  );
}
