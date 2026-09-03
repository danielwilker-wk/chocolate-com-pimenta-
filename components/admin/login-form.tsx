"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser-client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErro("Email ou password incorretos.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-xs tracking-[0.15em] uppercase text-mist mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-4 py-3 text-paper outline-none transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs tracking-[0.15em] uppercase text-mist mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-4 py-3 text-paper outline-none transition-colors"
        />
      </div>

      {erro && (
        <p className="text-sm text-red-400" role="alert">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex justify-center items-center bg-gold text-ink px-8 py-4 text-xs tracking-[0.15em] uppercase font-semibold hover:bg-white transition-colors duration-300 disabled:opacity-60"
      >
        {loading ? "A entrar..." : "Entrar"}
      </button>
    </form>
  );
}
