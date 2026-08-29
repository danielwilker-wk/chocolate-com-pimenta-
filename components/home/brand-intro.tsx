const stats = [
  { value: "3", label: "Negócios sob uma marca" },
  { value: "01", label: "Restaurante & bar" },
  { value: "02", label: "Lojas próprias" },
];

export default function BrandIntro() {
  return (
    <section className="relative py-28 md:py-36 px-6">
      <div className="mx-auto max-w-6xl grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-5">
            Descubra a Chocolate com Pimenta
          </p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6">
            Mais do que um lugar.
            <br />
            <span className="italic text-gold">Uma experiência.</span>
          </h2>
          <p className="text-mist leading-relaxed max-w-lg mb-6">
            A Chocolate com Pimenta nasceu para ser mais do que um restaurante.
            É uma marca que reúne gastronomia, entretenimento e comércio sob
            uma só identidade — pensada para quem procura sabor, ambiente e
            momentos que se repetem.
          </p>
          <p className="text-mist leading-relaxed max-w-lg">
            Do bar ao balcão da loja, cada unidade tem a sua própria
            personalidade, mas todas partilham o mesmo padrão de qualidade e
            cuidado.
          </p>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1400&auto=format&fit=crop"
              alt="Ambiente Chocolate com Pimenta"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-6 md:-left-10 bg-ink-soft border border-gold/30 px-6 py-6 md:px-8 md:py-7 flex gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl md:text-3xl text-gold">
                  {s.value}
                </p>
                <p className="text-[10px] md:text-xs text-mist uppercase tracking-wide mt-1 max-w-[6rem]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
