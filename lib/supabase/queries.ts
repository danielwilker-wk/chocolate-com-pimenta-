import { supabase } from "./client";

export type MenuCategoria = {
  id: string;
  nome: string;
  ordem: number;
};

export type MenuProduto = {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  foto_url: string | null;
  disponivel: boolean;
  ordem: number;
};

export type MenuCombo = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  foto_url: string | null;
  disponivel: boolean;
  ordem: number;
};

export type Loja = {
  id: string;
  slug: string;
  nome: string;
  localizacao: string | null;
  horario: string | null;
  telefone: string | null;
  whatsapp: string | null;
  foto_url: string | null;
  ordem: number;
};

export type Produto = {
  id: string;
  loja_id: string;
  categoria_id: string | null;
  nome: string;
  descricao: string | null;
  preco: number | null;
  foto_url: string | null;
  disponivel: boolean;
  ordem: number;
};

export type Evento = {
  id: string;
  nome: string;
  descricao: string | null;
  data: string | null;
  horario: string | null;
  foto_url: string | null;
  ordem: number;
};

export async function getMenuCategorias(): Promise<MenuCategoria[]> {
  const { data, error } = await supabase
    .from("menu_categorias")
    .select("id, nome, ordem")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMenuProdutos(): Promise<MenuProduto[]> {
  const { data, error } = await supabase
    .from("menu_produtos")
    .select("*")
    .eq("disponivel", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMenuCombos(): Promise<MenuCombo[]> {
  const { data, error } = await supabase
    .from("menu_combos")
    .select("*")
    .eq("disponivel", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLojas(): Promise<Loja[]> {
  const { data, error } = await supabase
    .from("lojas")
    .select("*")
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getLojaBySlug(slug: string): Promise<Loja | null> {
  const { data, error } = await supabase
    .from("lojas")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProdutosByLoja(lojaId: string): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*")
    .eq("loja_id", lojaId)
    .eq("disponivel", true)
    .order("ordem", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getEventos(): Promise<Evento[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("data", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type NovaReserva = {
  nome: string;
  telefone: string;
  email?: string;
  numero_pessoas: number;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  observacoes?: string;
};

export async function criarReserva(reserva: NovaReserva) {
  const { error } = await supabase.from("reservas").insert(reserva);
  if (error) throw error;
}

export type NovaMensagemContacto = {
  nome: string;
  email?: string;
  telefone?: string;
  assunto?: string;
  mensagem: string;
};

export async function enviarMensagemContacto(msg: NovaMensagemContacto) {
  const { error } = await supabase.from("mensagens_contacto").insert(msg);
  if (error) throw error;
}
