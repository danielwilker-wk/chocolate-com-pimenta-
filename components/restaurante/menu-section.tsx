import { getMenuCategorias, getMenuProdutos } from "@/lib/supabase/queries";
import BotaoAdicionar from "./botao-adicionar";

export default async function MenuSection() {
  const [categorias, produtos] = await Promise.all([
    getMenuCategorias(),
    getMenuProdutos(),
  ]);

  return (
    <section id="menu" className="py-20 md:py-28 px-6 bg-cacao/30">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Menu digital
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            Sabores que despertam os sentidos
          </h2>
          <p className="text-mist text-sm mt-4 max-w-md mx-auto">
            Escolhe os teus pratos e faz o pedido diretamente da tua mesa.
          </p>
        </div>

        <div className="space-y-16">
          {categorias.map((categoria) => {
            const itens = produtos.filter(
              (p) => p.categoria_id === categoria.id
            );
            return (
              <div key={categoria.id}>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="font-display italic text-2xl text-gold whitespace-nowrap">
                    {categoria.nome}
                  </h3>
                  <div className="hairline flex-1" />
                </div>

                {itens.length === 0 ? (
                  <p className="text-mist text-sm">
                    Produtos desta categoria a serem adicionados em breve.
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
                    {itens.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center gap-4 border-b border-white/5 pb-4"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-lg">{item.nome}</p>
                          {item.descricao && (
                            <p className="text-mist text-sm mt-1 leading-relaxed">
                              {item.descricao}
                            </p>
                          )}
                          <span className="text-gold text-sm mt-1 block">
                            {item.preco
                              ? `${item.preco.toLocaleString("pt-PT")} Kz`
                              : "[PREÇO]"}
                          </span>
                        </div>
                        <BotaoAdicionar
                          chave={`produto:${item.id}`}
                          produtoId={item.id}
                          nome={item.nome}
                          preco={item.preco}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
