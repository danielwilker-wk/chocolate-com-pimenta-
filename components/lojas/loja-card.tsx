import Link from "next/link";
import { ArrowUpRight, MapPin, Clock } from "lucide-react";
import type { Loja } from "@/lib/supabase/queries";

export default function LojaCard({ loja }: { loja: Loja }) {
  return (
    <Link
      href={`/lojas/${loja.slug}`}
      className="group relative block overflow-hidden border border-white/10 hover:border-gold/40 transition-colors duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden bg-ink-soft">
        {loja.foto_url ? (
          <img
            src={loja.foto_url}
            alt={loja.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-mist text-sm">
            [FOTO DA {loja.nome.toUpperCase()}]
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-2xl mb-3">{loja.nome}</h3>
        <div className="space-y-2 mb-5">
          <p className="flex items-start gap-2 text-mist text-sm">
            <MapPin size={15} className="mt-0.5 shrink-0 text-gold" />
            {loja.localizacao || "[LOCALIZAÇÃO]"}
          </p>
          <p className="flex items-start gap-2 text-mist text-sm">
            <Clock size={15} className="mt-0.5 shrink-0 text-gold" />
            {loja.horario || "[HORÁRIO]"}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-gold text-xs tracking-[0.15em] uppercase">
          Ver loja
          <ArrowUpRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </span>
      </div>
    </Link>
  );
}
