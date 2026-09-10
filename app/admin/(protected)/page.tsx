import { getPerfilAtual, ROTULO_PAPEL, areasVisiveis } from "@/lib/supabase/admin-auth";
import DashboardRestauranteBar from "@/components/admin/dashboard-restaurante-bar";

export const metadata = {
  title: "Painel administrativo",
};

export default async function AdminDashboardPage() {
  const perfil = await getPerfilAtual();
  const mostrarDashboard = perfil ? areasVisiveis(perfil.papel).vendas : false;

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Visão geral
      </p>
      <h1 className="font-display text-3xl mb-2">
        Olá, {perfil?.nome.split(" ")[0]}
      </h1>
      <p className="text-mist mb-10">
        {perfil ? ROTULO_PAPEL[perfil.papel] : ""} — este é o teu painel de
        gestão da Chocolate com Pimenta.
      </p>

      {mostrarDashboard ? (
        <DashboardRestauranteBar />
      ) : (
        <div className="border border-white/10 bg-ink-soft p-6 max-w-xl">
          <p className="text-sm text-mist leading-relaxed">
            Usa o menu à esquerda para gerir o menu do restaurante, reservas,
            eventos, ou o catálogo das lojas, consoante a tua área de acesso.
          </p>
        </div>
      )}
    </div>
  );
}
