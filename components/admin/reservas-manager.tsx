"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Check, X, Trash2 } from "lucide-react";

type Reserva = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  numero_pessoas: number;
  data: string;
  horario: string;
  observacoes: string | null;
  estado: "pendente" | "confirmada" | "cancelada";
  criado_em: string;
};

const ESTADO_COR: Record<Reserva["estado"], string> = {
  pendente: "text-gold border-gold",
  confirmada: "text-green-400 border-green-400",
  cancelada: "text-mist border-white/20",
};

export default function ReservasManager() {
  const supabase = createClient();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | Reserva["estado"]>("todas");

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservas")
      .select("*")
      .order("data", { ascending: true })
      .order("horario", { ascending: true });
    setReservas(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function mudarEstado(id: string, estado: Reserva["estado"]) {
    await supabase.from("reservas").update({ estado }).eq("id", id);
    carregar();
  }

  async function remover(id: string) {
    if (!confirm("Remover esta reserva definitivamente?")) return;
    await supabase.from("reservas").delete().eq("id", id);
    carregar();
  }

  if (loading) return <p className="text-mist">A carregar...</p>;

  const visiveis =
    filtro === "todas" ? reservas : reservas.filter((r) => r.estado === filtro);

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {(["todas", "pendente", "confirmada", "cancelada"] as const).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 text-xs uppercase tracking-wide border transition-colors ${
                filtro === f
                  ? "bg-gold text-ink border-gold"
                  : "border-white/15 text-mist hover:text-paper"
              }`}
            >
              {f}
            </button>
          )
        )}
      </div>

      {visiveis.length === 0 ? (
        <p className="text-mist">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {visiveis.map((r) => (
            <div key={r.id} className="border border-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg">{r.nome}</p>
                  <p className="text-mist text-sm">
                    {r.telefone}
                    {r.email ? ` · ${r.email}` : ""}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="text-gold">
                      {new Date(r.data + "T00:00:00").toLocaleDateString(
                        "pt-PT"
                      )}
                    </span>{" "}
                    às <span className="text-gold">{r.horario}</span> ·{" "}
                    {r.numero_pessoas}{" "}
                    {r.numero_pessoas === 1 ? "pessoa" : "pessoas"}
                  </p>
                  {r.observacoes && (
                    <p className="text-mist text-sm mt-2 italic">
                      &ldquo;{r.observacoes}&rdquo;
                    </p>
                  )}
                </div>

                <span
                  className={`text-[10px] uppercase px-3 py-1.5 border shrink-0 ${ESTADO_COR[r.estado]}`}
                >
                  {r.estado}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                {r.estado !== "confirmada" && (
                  <button
                    onClick={() => mudarEstado(r.id, "confirmada")}
                    className="inline-flex items-center gap-1 text-[10px] uppercase border border-green-400/40 text-green-400 px-3 py-1.5 hover:bg-green-400 hover:text-ink transition-colors"
                  >
                    <Check size={12} /> Confirmar
                  </button>
                )}
                {r.estado !== "cancelada" && (
                  <button
                    onClick={() => mudarEstado(r.id, "cancelada")}
                    className="inline-flex items-center gap-1 text-[10px] uppercase border border-white/20 text-mist px-3 py-1.5 hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    <X size={12} /> Cancelar
                  </button>
                )}
                <button
                  onClick={() => remover(r.id)}
                  className="inline-flex items-center gap-1 text-[10px] uppercase text-mist px-3 py-1.5 hover:text-red-400 transition-colors ml-auto"
                >
                  <Trash2 size={12} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
