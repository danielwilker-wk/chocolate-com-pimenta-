"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export type ItemCarrinho = {
  chave: string; // `produto:ID` ou `combo:ID`, para diferenciar
  produtoId?: string;
  comboId?: string;
  nome: string;
  preco: number;
  quantidade: number;
};

type CarrinhoContextType = {
  itens: ItemCarrinho[];
  aberto: boolean;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  adicionar: (item: Omit<ItemCarrinho, "quantidade">) => void;
  removerUm: (chave: string) => void;
  removerTudo: (chave: string) => void;
  limpar: () => void;
  total: number;
  quantidadeTotal: number;
};

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [aberto, setAberto] = useState(false);

  const adicionar = useCallback((item: Omit<ItemCarrinho, "quantidade">) => {
    setItens((prev) => {
      const existente = prev.find((i) => i.chave === item.chave);
      if (existente) {
        return prev.map((i) =>
          i.chave === item.chave ? { ...i, quantidade: i.quantidade + 1 } : i
        );
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
  }, []);

  const removerUm = useCallback((chave: string) => {
    setItens((prev) =>
      prev
        .map((i) =>
          i.chave === chave ? { ...i, quantidade: i.quantidade - 1 } : i
        )
        .filter((i) => i.quantidade > 0)
    );
  }, []);

  const removerTudo = useCallback((chave: string) => {
    setItens((prev) => prev.filter((i) => i.chave !== chave));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const total = useMemo(
    () => itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0),
    [itens]
  );

  const quantidadeTotal = useMemo(
    () => itens.reduce((soma, i) => soma + i.quantidade, 0),
    [itens]
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        aberto,
        abrirCarrinho: () => setAberto(true),
        fecharCarrinho: () => setAberto(false),
        adicionar,
        removerUm,
        removerTudo,
        limpar,
        total,
        quantidadeTotal,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) {
    throw new Error("useCarrinho deve ser usado dentro de um CarrinhoProvider");
  }
  return ctx;
}
