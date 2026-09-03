"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser-client";
import { Plus, X, Check, Ban, RotateCcw } from "lucide-react";
import { ROTULO_PAPEL, type PapelAdmin } from "@/lib/supabase/admin-roles";

type Perfil = {
  id: string;
  nome: string;
  papel: PapelAdmin;
  ativo: boolean;
};

const PAPEIS: PapelAdmin[] = [
  "admin",
  "gerente_restaurante",
  "gerente_loja01",
  "gerente_loja02",
];

export default function UsersManager({ meuId }: { meuId: string }) {
  const supabase = createClient();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [aCriar, setACriar] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("perfis_admin")
      .select("id, nome, papel, ativo")
      .order("nome");
    if (error) {
      setErro("Não foi possível carregar os utilizadores.");
    } else {
      setPerfis(data ?? []);
      setErro("");
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function alternarEstado(id: string, ativo: boolean) {
    const { error } = await supabase.rpc("alternar_estado_utilizador", {
      p_id: id,
      p_ativo: !ativo,
    });
    if (error) {
      alert(error.message);
      return;
    }
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

      <div className="space-y-3 max-w-2xl mb-8">
        {perfis.map((perfil) => (
          <div
            key={perfil.id}
            className="flex items-center justify-between gap-4 border border-white/10 px-5 py-4"
          >
            <div>
              <p
                className={`font-medium ${!perfil.ativo ? "text-mist line-through" : ""}`}
              >
                {perfil.nome}
              </p>
              <p className="text-xs text-gold">{ROTULO_PAPEL[perfil.papel]}</p>
            </div>
            {perfil.id !== meuId && (
              <button
                onClick={() => alternarEstado(perfil.id, perfil.ativo)}
                className={`inline-flex items-center gap-2 text-[10px] uppercase px-3 py-2 border transition-colors ${
                  perfil.ativo
                    ? "border-white/20 text-mist hover:border-red-400 hover:text-red-400"
                    : "border-gold text-gold hover:bg-gold hover:text-ink"
                }`}
              >
                {perfil.ativo ? (
                  <>
                    <Ban size={13} /> Desativar
                  </>
                ) : (
                  <>
                    <RotateCcw size={13} /> Reativar
                  </>
                )}
              </button>
            )}
            {perfil.id === meuId && (
              <span className="text-[10px] uppercase text-mist">
                (a tua conta)
              </span>
            )}
          </div>
        ))}
      </div>

      {aCriar ? (
        <NovoUtilizadorForm
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
          <Plus size={14} /> Criar novo utilizador
        </button>
      )}
    </div>
  );
}

function NovoUtilizadorForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [papel, setPapel] = useState<PapelAdmin>("gerente_restaurante");
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar() {
    if (!nome.trim() || !email.trim() || password.length < 8) {
      setErro("Preenche nome, email, e uma password com pelo menos 8 caracteres.");
      return;
    }
    setGuardando(true);
    setErro("");

    const { error } = await supabase.rpc("criar_utilizador_admin", {
      p_email: email.trim(),
      p_password: password,
      p_nome: nome.trim(),
      p_papel: papel,
    });

    setGuardando(false);

    if (error) {
      setErro(error.message);
      return;
    }
    onSaved();
  }

  return (
    <div className="border border-gold/30 p-6 max-w-md space-y-4">
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
          Nome
        </label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        />
      </div>
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
          Password provisória
        </label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
          placeholder="Mínimo 8 caracteres"
        />
        <p className="text-xs text-mist mt-1">
          Partilha esta password com a pessoa por um canal seguro. Ela pode
          alterá-la depois de entrar.
        </p>
      </div>
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
          Papel
        </label>
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value as PapelAdmin)}
          className="w-full bg-ink border border-white/15 focus:border-gold px-3 py-2 text-sm outline-none"
        >
          {PAPEIS.map((p) => (
            <option key={p} value={p}>
              {ROTULO_PAPEL[p]}
            </option>
          ))}
        </select>
      </div>

      {erro && <p className="text-red-400 text-sm">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <button
          onClick={guardar}
          disabled={guardando}
          className="inline-flex items-center gap-2 bg-gold text-ink px-5 py-2.5 text-xs uppercase font-semibold disabled:opacity-60"
        >
          <Check size={14} /> {guardando ? "A criar..." : "Criar utilizador"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 text-xs uppercase text-mist"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  );
}
