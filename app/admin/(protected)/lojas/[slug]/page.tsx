import { redirect, notFound } from "next/navigation";
import { getPerfilAtual, areasVisiveis } from "@/lib/supabase/admin-auth";
import LojaManager from "@/components/admin/loja-manager";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: `Gerir ${slug === "loja-01" ? "Loja 01" : "Loja 02"}` };
}

export default async function AdminLojaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== "loja-01" && slug !== "loja-02") notFound();

  const perfil = await getPerfilAtual();
  const areas = perfil ? areasVisiveis(perfil.papel) : null;
  const podeAceder =
    areas && ((slug === "loja-01" && areas.loja01) || (slug === "loja-02" && areas.loja02));

  if (!podeAceder) redirect("/admin");

  return (
    <div>
      <p className="text-gold text-xs tracking-[0.3em] uppercase mb-3">
        Lojas
      </p>
      <h1 className="font-display text-3xl mb-8">
        {slug === "loja-01" ? "Loja 01" : "Loja 02"}
      </h1>
      <LojaManager slug={slug} />
    </div>
  );
}
