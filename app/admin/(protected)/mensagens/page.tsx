import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import MensagensManager from "@/components/admin/mensagens-manager";

export const metadata = { title: "Mensagens" };

export default async function AdminMensagensPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).mensagens) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Administração
      </p>
      <h1 className="font-display text-3xl mb-8">Mensagens de contacto</h1>
      <MensagensManager />
    </div>
  );
}
