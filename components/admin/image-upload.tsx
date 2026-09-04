"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Upload, X, Loader2 } from "lucide-react";

export default function ImageUpload({
  value,
  onChange,
  label = "Foto",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErro("Escolhe um ficheiro de imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErro("A imagem tem de ter no máximo 5MB.");
      return;
    }

    setErro("");
    setEnviando(true);

    const extensao = file.name.split(".").pop();
    const nomeAleatorio = `${crypto.randomUUID()}.${extensao}`;

    const { error } = await supabase.storage
      .from("imagens")
      .upload(nomeAleatorio, file, { upsert: false });

    if (error) {
      setErro("Não foi possível enviar a imagem. Tenta novamente.");
      setEnviando(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("imagens")
      .getPublicUrl(nomeAleatorio);

    onChange(publicUrlData.publicUrl);
    setEnviando(false);
  }

  return (
    <div>
      <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative w-32 h-32 border border-white/15 overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Pré-visualização"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 bg-ink/80 text-paper p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remover imagem"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="w-32 h-32 border border-dashed border-white/20 hover:border-gold/50 flex flex-col items-center justify-center gap-2 text-mist hover:text-gold transition-colors disabled:opacity-60"
        >
          {enviando ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Upload size={20} />
          )}
          <span className="text-[10px] uppercase text-center px-2">
            {enviando ? "A enviar..." : "Escolher foto"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {erro && <p className="text-red-400 text-xs mt-2">{erro}</p>}
    </div>
  );
}
