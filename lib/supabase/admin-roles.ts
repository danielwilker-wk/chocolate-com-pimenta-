export type PapelAdmin =
  | "admin"
  | "gerente_restaurante"
  | "gerente_loja01"
  | "gerente_loja02";

export type PerfilAdmin = {
  id: string;
  nome: string;
  papel: PapelAdmin;
  ativo: boolean;
  email?: string;
};

export const ROTULO_PAPEL: Record<PapelAdmin, string> = {
  admin: "Administrador",
  gerente_restaurante: "Gerente do Restaurante",
  gerente_loja01: "Gerente da Loja 01",
  gerente_loja02: "Gerente da Loja 02",
};

/** Áreas do painel que cada papel pode ver, usadas para construir o menu lateral. */
export function areasVisiveis(papel: PapelAdmin) {
  return {
    menu: papel === "admin" || papel === "gerente_restaurante",
    vendas: papel === "admin" || papel === "gerente_restaurante",
    estoque: papel === "admin" || papel === "gerente_restaurante",
    reservas: papel === "admin" || papel === "gerente_restaurante",
    eventos: papel === "admin" || papel === "gerente_restaurante",
    loja01: papel === "admin" || papel === "gerente_loja01",
    loja02: papel === "admin" || papel === "gerente_loja02",
    lojasGeral: papel === "admin",
    utilizadores: papel === "admin",
    mensagens: papel === "admin",
  };
}
