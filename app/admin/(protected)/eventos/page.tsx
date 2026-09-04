import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import EventosManager from "@/components/admin/eventos-manager";

export const metadata = { title: "Eventos" };

export default async function AdminEventosPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).eventos) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Entretenimento
      </p>
      <h1 className="font-display text-3xl mb-8">Eventos & Experiências</h1>
      <EventosManager />
    </div>
  );
}
