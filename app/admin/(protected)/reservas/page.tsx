import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import ReservasManager from "@/components/admin/reservas-manager";

export const metadata = { title: "Reservas" };

export default async function AdminReservasPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).reservas) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante
      </p>
      <h1 className="font-display text-3xl mb-8">Reservas</h1>
      <ReservasManager />
    </div>
  );
}
