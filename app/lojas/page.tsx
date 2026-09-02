import { getLojas } from "@/lib/supabase/queries";
import LojaCard from "@/components/lojas/loja-card";

export const metadata = {
  title: "Nossas Lojas",
  description: "Descubra as lojas Chocolate com Pimenta.",
};

export const dynamic = "force-dynamic";

export default async function LojasPage() {
  const lojas = await getLojas();

  return (
    <div className="pt-32 md:pt-40 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            A marca
          </p>
          <h1 className="font-display text-3xl md:text-5xl">Nossas Lojas</h1>
        </div>

        {lojas.length === 0 ? (
          <p className="text-mist text-center">
            Informações das lojas a serem adicionadas em breve.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {lojas.map((loja) => (
              <LojaCard key={loja.id} loja={loja} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
