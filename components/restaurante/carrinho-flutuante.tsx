"use client";

import { useState } from "react";
import { ShoppingBag, X, Plus, Minus, Check } from "lucide-react";
import { useCarrinho } from "./carrinho-context";
import { createClient } from "@/lib/supabase/browser-client";

type FormaPagamento = "dinheiro" | "multicaixa";

export default function CarrinhoFlutuante() {
  const {
    itens,
    aberto,
    abrirCarrinho,
    fecharCarrinho,
    adicionar,
    removerUm,
    removerTudo,
    limpar,
    total,
    quantidadeTotal,
  } = useCarrinho();

  const [etapa, setEtapa] = useState<"carrinho" | "dados" | "sucesso">(
    "carrinho"
  );
  const [numeroMesa, setNumeroMesa] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("dinheiro");
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function fecharTudo() {
    fecharCarrinho();
    setTimeout(() => setEtapa("carrinho"), 300);
  }

  async function enviarPedido() {
    if (!numeroMesa.trim() || !nomeCliente.trim()) {
      setErro("Indica o número da mesa e o teu nome.");
      return;
    }
    setEnviando(true);
    setErro("");

    const supabase = createClient();

    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .insert({
        numero_mesa: numeroMesa.trim(),
        nome_cliente: nomeCliente.trim(),
        forma_pagamento: formaPagamento,
        observacoes: observacoes.trim() || null,
        total,
      })
      .select()
      .single();

    if (erroPedido || !pedido) {
      setErro("Não foi possível enviar o pedido. Tenta novamente.");
      setEnviando(false);
      return;
    }

    const { error: erroItens } = await supabase.from("pedido_itens").insert(
      itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produtoId ?? null,
        combo_id: item.comboId ?? null,
        nome_produto: item.nome,
        preco_unitario: item.preco,
        quantidade: item.quantidade,
      }))
    );

    setEnviando(false);

    if (erroItens) {
      setErro("O pedido foi criado, mas houve um problema com os itens.");
      return;
    }

    setEtapa("sucesso");
    limpar();
  }

  if (quantidadeTotal === 0 && !aberto) return null;

  return (
    <>
      {/* Botão flutuante */}
      {quantidadeTotal > 0 && !aberto && (
        <button
          onClick={abrirCarrinho}
          className="fixed bottom-24 right-6 z-40 bg-gold text-ink px-5 py-3.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex items-center gap-2.5 hover:bg-white transition-colors duration-300"
        >
          <ShoppingBag size={18} />
          <span className="text-sm font-semibold">
            {quantidadeTotal} · {total.toLocaleString("pt-PT")} Kz
          </span>
        </button>
      )}

      {/* Painel do carrinho */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={fecharTudo}
            aria-hidden
          />
          <div className="relative z-10 bg-ink-soft border border-gold/30 w-full sm:max-w-md sm:mx-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-display text-xl">
                {etapa === "carrinho" && "O teu pedido"}
                {etapa === "dados" && "Dados do pedido"}
                {etapa === "sucesso" && "Pedido enviado"}
              </h3>
              <button
                onClick={fecharTudo}
                className="text-mist hover:text-paper"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 flex-1">
              {etapa === "carrinho" && (
                <>
                  {itens.length === 0 ? (
                    <p className="text-mist text-sm">O carrinho está vazio.</p>
                  ) : (
                    <div className="space-y-4">
                      {itens.map((item) => (
                        <div
                          key={item.chave}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm truncate">{item.nome}</p>
                            <p className="text-gold text-xs">
                              {item.preco.toLocaleString("pt-PT")} Kz
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => removerUm(item.chave)}
                              className="w-6 h-6 flex items-center justify-center border border-white/20 text-mist hover:text-paper"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-sm w-4 text-center">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() =>
                                adicionar({
                                  chave: item.chave,
                                  produtoId: item.produtoId,
                                  comboId: item.comboId,
                                  nome: item.nome,
                                  preco: item.preco,
                                })
                              }
                              className="w-6 h-6 flex items-center justify-center border border-white/20 text-mist hover:text-paper"
                            >
                              <Plus size={11} />
                            </button>
                            <button
                              onClick={() => removerTudo(item.chave)}
                              aria-label="Remover item"
                              className="text-mist hover:text-red-400 ml-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {etapa === "dados" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
                      Número da mesa <span className="text-gold">*</span>
                    </label>
                    <input
                      value={numeroMesa}
                      onChange={(e) => setNumeroMesa(e.target.value)}
                      className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2.5 text-sm outline-none"
                      placeholder="Ex: 5"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
                      O teu nome <span className="text-gold">*</span>
                    </label>
                    <input
                      value={nomeCliente}
                      onChange={(e) => setNomeCliente(e.target.value)}
                      className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2.5 text-sm outline-none"
                      placeholder="Como te chamamos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
                      Forma de pagamento
                    </label>
                    <div className="flex gap-2">
                      {(["dinheiro", "multicaixa"] as const).map((fp) => (
                        <button
                          key={fp}
                          onClick={() => setFormaPagamento(fp)}
                          className={`flex-1 px-3 py-2.5 text-xs uppercase border transition-colors ${
                            formaPagamento === fp
                              ? "bg-gold text-ink border-gold font-semibold"
                              : "border-white/15 text-mist hover:text-paper"
                          }`}
                        >
                          {fp === "dinheiro" ? "Dinheiro" : "Multicaixa"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-mist mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border border-white/15 focus:border-gold px-3 py-2.5 text-sm outline-none resize-none"
                      placeholder="Ex: sem cebola, ponto da carne..."
                    />
                  </div>
                  {erro && <p className="text-red-400 text-xs">{erro}</p>}
                </div>
              )}

              {etapa === "sucesso" && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-gold/20 border border-gold flex items-center justify-center mx-auto mb-5">
                    <Check size={24} className="text-gold" />
                  </div>
                  <p className="font-display text-xl mb-2">
                    Pedido enviado!
                  </p>
                  <p className="text-mist text-sm">
                    Vamos preparar o teu pedido para a mesa {numeroMesa}.
                    Obrigado, {nomeCliente}.
                  </p>
                </div>
              )}
            </div>

            {etapa !== "sucesso" && itens.length > 0 && (
              <div className="p-5 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-base">
                  <span className="text-mist">Total</span>
                  <span className="text-gold font-display text-lg">
                    {total.toLocaleString("pt-PT")} Kz
                  </span>
                </div>
                {etapa === "carrinho" ? (
                  <button
                    onClick={() => setEtapa("dados")}
                    className="w-full bg-gold text-ink px-6 py-3.5 text-xs uppercase tracking-wide font-semibold hover:bg-white transition-colors"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    onClick={enviarPedido}
                    disabled={enviando}
                    className="w-full bg-gold text-ink px-6 py-3.5 text-xs uppercase tracking-wide font-semibold hover:bg-white transition-colors disabled:opacity-60"
                  >
                    {enviando ? "A enviar..." : "Enviar pedido"}
                  </button>
                )}
              </div>
            )}

            {etapa === "sucesso" && (
              <div className="p-5 border-t border-white/10">
                <button
                  onClick={fecharTudo}
                  className="w-full border border-gold/40 text-gold px-6 py-3 text-xs uppercase tracking-wide hover:bg-gold hover:text-ink transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
