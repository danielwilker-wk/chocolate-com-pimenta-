"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import ImageUpload from "./image-upload";

type Evento = {
  id: string;
  nome: string;
  descricao: string | null;
  data: string | null;
  horario: string | null;
  foto_url: string | null;
  ordem: number;
};

export default function EventosManager() {
  const supabase = createClient();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [aCriar, setACriar] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("data", { ascending: true, nullsFirst: false });
    if (error) {
      setErro("Não foi possível carregar os eventos.");
    } else {
      setEventos(data ?? []);
      setErro("");
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function remover(id: string) {
    if (!confirm("Remover este evento?")) return;
    await supabase.from("eventos").delete().eq("id", id);
    carregar();
  }

  if (loading) return <p className="text-mist">A carregar...</p>;

  return (
    <div>
      {erro && (
        <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 px-4 py-3 mb-6">
          {erro}
        </p>
      )}

      <div className="space-y-4 max-w-2xl mb-8">
        {eventos.length === 0 && !aCriar && (
          <p className="text-mist text-sm">
            Ainda não há eventos publicados.
          </p>
        )}

        {eventos.map((evento) => (
          <EventoRow
            key={evento.id}
            evento={evento}
            onSaved={carregar}
            onDelete={() => remover(evento.id)}
          />
        ))}
      </div>

      {aCriar ? (
        <NovoEventoForm
          onCancel={() => setACriar(false)}
          onSaved={() => {
            setACriar(false);
            carregar();
          }}
        />
      ) : (
        <button
          onClick={() => setACriar(true)}
          className="inline-flex items-center gap-2 bg-gold text-ink px-5 py-3 text-xs uppercase tracking-wide font-semibold hover:bg-white transition-colors"
        >
          <Plus size={14} /> Publicar novo evento
        </button>
      )}
    </div>
  );
}

function formatarData(data: string | null) {
  if (!data) return null;
  return new Date(data + "T00:00:00").toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function EventoRow({
  evento,
  onSaved,
  onDelete,
}: {
  evento: Evento;
  onSaved: () => void;
  onDelete: () => void;
}) {
  const supabase = createClient();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(evento.nome);
  const [descricao, setDescricao] = useState(evento.descricao ?? "");
  const [data, setData] = useState(evento.data ?? "");
  const [horario, setHorario] = useState(evento.horario ?? "");
  const [fotoUrl, setFotoUrl] = useState<string | null>(evento.foto_url);

  async function guardar() {
    await supabase
      .from("eventos")
      .update({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        data: data || null,
        horario: horario || null,
        foto_url: fotoUrl,
      })
      .eq("id", evento.id);
    setEditando(false);
    onSaved();
  }

  if (editando) {
    return (
      <div className="border border-gold/30 p-5 space-y-3">
        <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto" />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Nome do evento"
        />
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Descrição (opcional)"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={data}
            onChange={(e) => setData(e.target.value)}
            type="date"
            className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none [color-scheme:dark]"
          />
          <input
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            type="time"
            className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none [color-scheme:dark]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={guardar}
            className="inline-flex items-center gap-1 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold"
          >
            <Check size={14} /> Guardar
          </button>
          <button
            onClick={() => setEditando(false)}
            className="inline-flex items-center gap-1 border border-white/20 px-4 py-2 text-xs uppercase text-mist"
          >
            <X size={14} /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 border border-white/10 p-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 shrink-0 bg-ink-soft border border-white/10 overflow-hidden">
          {evento.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={evento.foto_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg truncate">{evento.nome}</p>
          <p className="text-gold text-xs">
            {formatarData(evento.data) || "Data por definir"}
            {evento.horario ? ` · ${evento.horario}` : ""}
          </p>
          {evento.descricao && (
            <p className="text-mist text-xs truncate mt-1">
              {evento.descricao}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setEditando(true)}
          aria-label="Editar"
          className="text-mist hover:text-gold transition-colors p-1"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Remover"
          className="text-mist hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function NovoEventoForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar() {
    if (!nome.trim()) {
      setErro("O nome do evento é obrigatório.");
      return;
    }
    setGuardando(true);
    setErro("");
    const { error } = await supabase.from("eventos").insert({
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      data: data || null,
      horario: horario || null,
      foto_url: fotoUrl,
    });
    setGuardando(false);

    if (error) {
      setErro("Não foi possível guardar. Tenta novamente.");
      return;
    }
    onSaved();
  }

  return (
    <div className="border border-gold/30 p-5 max-w-2xl space-y-3">
      <ImageUpload value={fotoUrl} onChange={setFotoUrl} label="Foto" />
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Nome do evento (ex: Noite de Karaoke)"
        autoFocus
      />
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        placeholder="Descrição (opcional)"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
            Data
          </label>
          <input
            value={data}
            onChange={(e) => setData(e.target.value)}
            type="date"
            className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
            Horário
          </label>
          <input
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            type="time"
            className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none [color-scheme:dark]"
          />
        </div>
      </div>
      {erro && <p className="text-red-400 text-xs">{erro}</p>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center gap-1 bg-gold text-ink px-4 py-2 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> {guardando ? "A publicar..." : "Publicar evento"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 border border-white/20 px-4 py-2 text-xs uppercase text-mist"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}
