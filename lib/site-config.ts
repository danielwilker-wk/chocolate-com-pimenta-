// Configuração central da marca.
// Todos os valores marcados com [ ] são placeholders — substituir por dados reais.

export const siteConfig = {
  brandName: "Chocolate com Pimenta",
  tagline: "Uma marca. Diferentes experiências.",
  whatsapp: {
    restaurante: "244976684181",
    loja01: "[NÚMERO DE WHATSAPP — LOJA 01]",
    loja02: "[NÚMERO DE WHATSAPP — LOJA 02]",
    geral: "244976684181",
  },
  contacts: {
    phone: "976 684 181 / 959 906 739",
    email: "[EMAIL]",
    address: "Lubango, Chioco, próximo ao salão Crismel, adjacente ao antigo BCI",
    hours: "[HORÁRIO DE FUNCIONAMENTO]",
  },
  social: {
    instagram: "[LINK INSTAGRAM]",
    facebook: "[LINK FACEBOOK]",
  },
  navLinks: [
    { label: "Início", href: "/" },
    { label: "Sobre nós", href: "/sobre" },
    { label: "Restaurante & Bar", href: "/restaurante" },
    { label: "Lojas", href: "/lojas" },
    { label: "Eventos", href: "/eventos" },
    { label: "Contactos", href: "/contactos" },
  ],
  restauranteCombos: [
    { name: "Tábua Mista Mini", price: "[PREÇO]" },
    { name: "Tábua Mista Média", price: "[PREÇO]" },
    { name: "Tábua Mista Super", price: "[PREÇO]" },
    { name: "Tábua Mista Mega", price: "[PREÇO]" },
    { name: "Combo Sempre a Subir", price: "[PREÇO]" },
    { name: "Combo Cambas", price: "[PREÇO]" },
    { name: "Combo Casal", price: "[PREÇO]" },
    { name: "Combo Promo", price: "[PREÇO]" },
  ],
  businesses: [
    {
      id: "restaurante",
      title: "Restaurante & Bar",
      description:
        "Sabores, bebidas, ambiente e experiências para momentos especiais.",
      href: "/restaurante",
      cta: "Explorar",
      image:
        "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: "loja01",
      title: "Loja 01",
      description: "Descubra os produtos disponíveis na nossa primeira unidade.",
      href: "/lojas/loja-01",
      cta: "Ver loja",
      image:
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: "loja02",
      title: "Loja 02",
      description:
        "Produtos, conveniência e qualidade numa segunda experiência Chocolate com Pimenta.",
      href: "/lojas/loja-02",
      cta: "Ver loja",
      image:
        "https://images.unsplash.com/photo-1601599963565-b7f49deb6f1a?q=80&w=1600&auto=format&fit=crop",
    },
  ],
} as const;

export function buildWhatsAppLink(number: string, message: string) {
  const digits = number.replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(message);
  // Se o número ainda for um placeholder, o link fica desativado visualmente pelo componente que o usa.
  return `https://wa.me/${digits}?text=${encoded}`;
}
