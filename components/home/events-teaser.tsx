import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getEventos } from "@/lib/supabase/queries";

function formatarData(data: string | null) {
  if (!data) return null;
  return new Date(data + "T00:00:00").toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
  });
}

export default async function EventsTeaser() {
  const todosEventos = await getEventos();
  const eventos = todosEventos.slice(0, 3);

  if (eventos.length === 0) return null;

  return (
    <section className="py-24 md:py-32 px-6 bg-cacao/40">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
              Entretenimento
            </p>
            <h2 className="font-display text-3xl md:text-5xl">
              Eventos & experiências
            </h2>
          </div>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-sm text-mist hover:text-gold transition-colors"
          >
            Ver todos os eventos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <Link
              href="/eventos"
              key={evento.id}
              className="group border border-white/5 hover:border-gold/30 transition-colors duration-300 block"
            >
              <div className="aspect-[4/3] overflow-hidden bg-ink-soft">
                {evento.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evento.foto_url}
                    alt={evento.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                <h3 className="font-display text-xl mb-4">{evento.nome}</h3>
                <span className="text-xs tracking-[0.15em] uppercase text-mist group-hover:text-gold transition-colors">
                  Ver detalhes
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
