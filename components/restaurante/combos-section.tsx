import { getMenuCombos } from "@/lib/supabase/queries";
import { buildWhatsAppLink, siteConfig } from "@/lib/site-config";

export default async function CombosSection() {
  const combos = await getMenuCombos();

  return (
    <section className="py-20 md:py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Os melhores preços
          </p>
          <h2 className="font-display text-3xl md:text-5xl">Combos</h2>
        </div>

        {combos.length === 0 ? (
          <p className="text-mist text-center">
            Combos a serem adicionados em breve.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {combos.map((combo) => {
              const link = buildWhatsAppLink(
                siteConfig.whatsapp.restaurante,
                `Olá, Chocolate com Pimenta. Gostaria de pedir o ${combo.nome}.`
              );
              return (
                <div
                  key={combo.id}
                  className="bg-ink p-6 flex flex-col justify-between min-h-[180px] group hover:bg-ink-soft transition-colors duration-300"
                >
                  <div>
                    <h3 className="font-display text-lg mb-2">
                      {combo.nome}
                    </h3>
                    {combo.descricao && (
                      <p className="text-mist text-sm leading-relaxed">
                        {combo.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-gold font-display text-lg">
                      {combo.preco
                        ? `${combo.preco.toLocaleString("pt-PT")} Kz`
                        : "[PREÇO]"}
                    </span>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-[0.1em] uppercase text-mist group-hover:text-gold transition-colors"
                    >
                      Pedir →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
