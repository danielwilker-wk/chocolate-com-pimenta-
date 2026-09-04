"use client";

import { useState } from "react";
import { enviarMensagemContacto } from "@/lib/supabase/queries";

export default function ContactoForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sucesso" | "erro">(
    "idle"
  );
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const nome = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefone = String(data.get("telefone") || "").trim();
    const assunto = String(data.get("assunto") || "").trim();
    const mensagem = String(data.get("mensagem") || "").trim();

    if (!nome || !mensagem) {
      setErro("Preenche pelo menos o nome e a mensagem.");
      setStatus("erro");
      return;
    }

    try {
      await enviarMensagemContacto({
        nome,
        email: email || undefined,
        telefone: telefone || undefined,
        assunto: assunto || undefined,
        mensagem,
      });
      setStatus("sucesso");
      form.reset();
    } catch {
      setErro("Não foi possível enviar a mensagem. Tenta novamente.");
      setStatus("erro");
    }
  }

  if (status === "sucesso") {
    return (
      <div className="border border-gold/30 bg-ink-soft p-8 md:p-10 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
          Mensagem enviada
        </p>
        <p className="font-display text-2xl mb-3">Obrigado por contactar.</p>
        <p className="text-mist">Responderemos assim que possível.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" name="nome" required autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field
          label="Telefone"
          name="telefone"
          type="tel"
          autoComplete="tel"
        />
        <Field label="Assunto" name="assunto" />
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
          Mensagem <span className="text-gold">*</span>
        </label>
        <textarea
          name="mensagem"
          rows={5}
          required
          className="w-full bg-transparent border border-white/15 focus:border-gold px-4 py-3 text-paper placeholder:text-mist/50 outline-none transition-colors"
          placeholder="Escreve a tua mensagem..."
        />
      </div>

      {status === "erro" && (
        <p className="text-sm text-red-400" role="alert">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full md:w-auto inline-flex justify-center items-center bg-gold text-ink px-10 py-4 text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition-colors duration-300 disabled:opacity-60"
      >
        {status === "loading" ? "A enviar..." : "Enviar mensagem"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs tracking-[0.15em] uppercase text-mist mb-2"
      >
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-4 py-3 text-paper outline-none transition-colors"
      />
    </div>
  );
}
