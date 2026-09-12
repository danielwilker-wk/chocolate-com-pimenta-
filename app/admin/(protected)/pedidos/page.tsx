import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import PedidosManager from "@/components/admin/pedidos-manager";

export const metadata = { title: "Pedidos" };

export default async function AdminPedidosPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).reservas) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante & Bar
      </p>
      <h1 className="font-display text-3xl mb-8">Pedidos das mesas</h1>
      <PedidosManager />
    </div>
  );
}
