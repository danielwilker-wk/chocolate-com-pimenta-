import { redirect } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import ArquivoPedidos from "@/components/admin/arquivo-pedidos";

export const metadata = { title: "Arquivo de pedidos" };

export default async function AdminArquivoPage() {
  const perfil = await getPerfilAtual();
  if (!perfil || !areasVisiveis(perfil.papel).reservas) {
    redirect("/admin");
  }

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Restaurante & Bar
      </p>
      <h1 className="font-display text-3xl mb-2">Arquivo de pedidos</h1>
      <p className="text-mist mb-8 max-w-lg">
        Pedidos de dias anteriores, organizados por mês, semana e dia.
        Arquivados automaticamente todos os dias à meia-noite.
      </p>
      <ArquivoPedidos />
    </div>
  );
}
