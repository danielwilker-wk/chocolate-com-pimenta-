import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // O Next.js App Router intercepta chamadas fetch() feitas dentro de
    // Server Components e pode aplicar cache a elas mesmo quando a página
    // está marcada como `force-dynamic`. Isto fazia com que imagens e
    // textos editados no admin (Menu, Lojas, Conteúdo do site) demorassem
    // a aparecer, ou só aparecessem em páginas visitadas diretamente.
    // Forçamos aqui `cache: "no-store"` para todas as chamadas deste
    // cliente, garantindo que o site público lê sempre os dados mais
    // recentes da base de dados.
    fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
  },
});
