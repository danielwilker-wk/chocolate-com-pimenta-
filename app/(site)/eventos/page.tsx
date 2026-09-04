import { getEventos } from "@/lib/supabase/queries";

export const metadata = {
  title: "Eventos & Experiências",
  description: "Karaoke, música ao vivo, noites temáticas e eventos especiais na Chocolate com Pimenta.",
};

export const dynamic = "force-dynamic";

function formatarData(data: string | null) {
  if (!data) return null;
  return new Date(data + "T00:00:00").toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function EventosPage() {
  const eventos = await getEventos();

  return (
    <div className="pt-32 md:pt-40 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Entretenimento
          </p>
          <h1 className="font-display text-3xl md:text-5xl">
            Eventos & Experiências
          </h1>
        </div>

        {eventos.length === 0 ? (
          <p className="text-mist text-center">
            Nenhum evento publicado no momento. Volta em breve.
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="border border-white/10 hover:border-gold/30 transition-colors duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-ink-soft">
                  {evento.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={evento.foto_url}
                      alt={evento.nome}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-mist text-sm">
                      Chocolate com Pimenta
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-gold text-xs tracking-wide uppercase mb-2">
                    {[formatarData(evento.data), evento.horario]
                      .filter(Boolean)
                      .join(" · ") || "Data a confirmar"}
                  </p>
                  <h3 className="font-display text-xl mb-3">{evento.nome}</h3>
                  {evento.descricao && (
                    <p className="text-mist text-sm leading-relaxed">
                      {evento.descricao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
