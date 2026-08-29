"use client";

import { useState } from "react";
import { criarReserva } from "@/lib/supabase/queries";

export default function ReservaForm() {
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
    const telefone = String(data.get("telefone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const numeroPessoas = Number(data.get("numero_pessoas"));
    const dataReserva = String(data.get("data") || "");
    const horario = String(data.get("horario") || "");
    const observacoes = String(data.get("observacoes") || "").trim();

    if (!nome || !telefone || !numeroPessoas || !dataReserva || !horario) {
      setErro("Preenche todos os campos obrigatórios.");
      setStatus("erro");
      return;
    }

    try {
      await criarReserva({
        nome,
        telefone,
        email: email || undefined,
        numero_pessoas: numeroPessoas,
        data: dataReserva,
        horario,
        observacoes: observacoes || undefined,
      });
      setStatus("sucesso");
      form.reset();
    } catch {
      setErro("Não foi possível enviar a reserva. Tenta novamente.");
      setStatus("erro");
    }
  }

  if (status === "sucesso") {
    return (
      <div className="border border-gold/30 bg-ink-soft p-8 md:p-10 text-center">
        <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
          Reserva enviada
        </p>
        <p className="font-display text-2xl mb-3">
          Recebemos o seu pedido de reserva.
        </p>
        <p className="text-mist">
          Entraremos em contacto para confirmar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" name="nome" required autoComplete="name" />
        <Field
          label="Telefone"
          name="telefone"
          required
          type="tel"
          autoComplete="tel"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field
          label="Número de pessoas"
          name="numero_pessoas"
          type="number"
          min={1}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Data" name="data" type="date" required />
        <Field label="Horário" name="horario" type="time" required />
      </div>

      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
          Observações
        </label>
        <textarea
          name="observacoes"
          rows={4}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-4 py-3 text-paper placeholder:text-mist/50 outline-none transition-colors"
          placeholder="Alguma preferência ou pedido especial?"
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
        {status === "loading" ? "A enviar..." : "Solicitar reserva"}
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
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  min?: number;
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
        min={min}
        className="w-full bg-transparent border border-white/15 focus:border-gold px-4 py-3 text-paper outline-none transition-colors [color-scheme:dark]"
      />
    </div>
  );
}
