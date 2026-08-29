import Link from "next/link";
import { ArrowRight } from "lucide-react";

const events = [
  {
    name: "[NOME DO EVENTO]",
    date: "[DATA]",
    time: "[HORÁRIO]",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "[NOME DO EVENTO]",
    date: "[DATA]",
    time: "[HORÁRIO]",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "[NOME DO EVENTO]",
    date: "[DATA]",
    time: "[HORÁRIO]",
    image:
      "https://images.unsplash.com/photo-1571266028243-e4bb35e9c1a4?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function EventsTeaser() {
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
          {events.map((event, i) => (
            <div
              key={i}
              className="group border border-white/5 hover:border-gold/30 transition-colors duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <p className="text-gold text-xs tracking-wide uppercase mb-2">
                  {event.date} · {event.time}
                </p>
                <h3 className="font-display text-xl mb-4">{event.name}</h3>
                <Link
                  href="/eventos"
                  className="text-xs tracking-[0.15em] uppercase text-mist hover:text-gold transition-colors"
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
