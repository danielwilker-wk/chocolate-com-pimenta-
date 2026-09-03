import { redirect } from "next/navigation";
import { getPerfilAtual } from "@/lib/supabase/admin-auth";
import AdminSidebar from "@/components/admin/admin-sidebar";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await getPerfilAtual();

  // O middleware já trata do redirecionamento para /admin/login,
  // mas esta verificação extra evita renderizar conteúdo sensível
  // caso o perfil não exista ou esteja inativo.
  if (!perfil) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ink text-paper">
      <AdminSidebar nome={perfil.nome} papel={perfil.papel} />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
