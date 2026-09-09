import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import ConteudoManager from "@/components/admin/conteudo-manager";

export const metadata = { title: "Conteúdo do site" };

export default async function AdminConteudoPage() {
  const perfil = await getPerfilAtual();
  // Reaproveita a permissão de admin: conteúdo institucional é global à marca.
  if (!perfil || !areasVisiveis(perfil.papel).lojasGeral) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Administração
      </p>
      <h1 className="font-display text-3xl mb-2">Conteúdo do site</h1>
      <p className="text-mist mb-10 max-w-lg">
        Edita os textos e imagens institucionais que aparecem no site
        público, sem precisares de mexer em código.
      </p>
      <ConteudoManager />
    </div>
  );
}
