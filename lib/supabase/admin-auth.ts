import { createClient as createServerSupabase } from "./server-client";
import type { PerfilAdmin } from "./admin-roles";

export type { PapelAdmin, PerfilAdmin } from "./admin-roles";
export { ROTULO_PAPEL, areasVisiveis } from "./admin-roles";

/**
 * Devolve o utilizador administrativo autenticado atual (ou null),
 * a usar em Server Components / layouts protegidos.
 */
export async function getPerfilAtual(): Promise<PerfilAdmin | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("perfis_admin")
    .select("id, nome, papel, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.ativo) return null;

  return { ...perfil, email: user.email };
}
