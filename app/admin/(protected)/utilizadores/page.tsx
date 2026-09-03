import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import UsersManager from "@/components/admin/users-manager";

export const metadata = { title: "Utilizadores" };

export default async function AdminUtilizadoresPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).utilizadores) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Administração
      </p>
      <h1 className="font-display text-3xl mb-2">Utilizadores</h1>
      <p className="text-mist mb-8 max-w-lg">
        Cria contas para gerentes de cada unidade. Cada um só vê e gere a sua
        área depois de entrar.
      </p>
      <UsersManager meuId={perfil.id} />
    </div>
  );
}
