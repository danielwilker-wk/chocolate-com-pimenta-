"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Trash2, Mail, MailOpen } from "lucide-react";

type Mensagem = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
  lida: boolean;
  criado_em: string;
};

export default function MensagensManager() {
  const supabase = createClient();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "nao-lidas">("todas");

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("mensagens_contacto")
      .select("*")
      .order("criado_em", { ascending: false });
    setMensagens(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternarLida(id: string, lida: boolean) {
    await supabase
      .from("mensagens_contacto")
      .update({ lida: !lida })
      .eq("id", id);
    carregar();
  }

  async function remover(id: string) {
    if (!confirm("Remover esta mensagem?")) return;
    await supabase.from("mensagens_contacto").delete().eq("id", id);
    carregar();
  }

  if (loading) return <p className="text-mist">A carregar...</p>;

  const visiveis =
    filtro === "nao-lidas" ? mensagens.filter((m) => !m.lida) : mensagens;

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {(["todas", "nao-lidas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 text-xs uppercase tracking-wide border transition-colors ${
              filtro === f
                ? "bg-gold text-ink border-gold"
                : "border-white/15 text-mist hover:text-paper"
            }`}
          >
            {f === "todas" ? "Todas" : "Não lidas"}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <p className="text-mist">Nenhuma mensagem encontrada.</p>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {visiveis.map((m) => (
            <div
              key={m.id}
              className={`border p-5 ${m.lida ? "border-white/10" : "border-gold/40 bg-ink-soft"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg flex items-center gap-2">
                    {m.nome}
                    {!m.lida && (
                      <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                    )}
                  </p>
                  <p className="text-mist text-sm">
                    {[m.email, m.telefone].filter(Boolean).join(" · ")}
                  </p>
                  {m.assunto && (
                    <p className="text-gold text-xs mt-1">{m.assunto}</p>
                  )}
                  <p className="text-paper text-sm mt-3 leading-relaxed max-w-xl">
                    {m.mensagem}
                  </p>
                  <p className="text-mist text-xs mt-3">
                    {new Date(m.criado_em).toLocaleString("pt-PT")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => alternarLida(m.id, m.lida)}
                  className="inline-flex items-center gap-1 text-[10px] uppercase border border-white/20 text-mist px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
                >
                  {m.lida ? <Mail size={12} /> : <MailOpen size={12} />}
                  {m.lida ? "Marcar por ler" : "Marcar como lida"}
                </button>
                <button
                  onClick={() => remover(m.id)}
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
