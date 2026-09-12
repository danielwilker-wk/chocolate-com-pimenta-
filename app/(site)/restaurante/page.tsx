import RestauranteHero from "@/components/restaurante/restaurante-hero";
import MenuSection from "@/components/restaurante/menu-section";
import CombosSection from "@/components/restaurante/combos-section";
import { CarrinhoProvider } from "@/components/restaurante/carrinho-context";
import CarrinhoFlutuante from "@/components/restaurante/carrinho-flutuante";

export const metadata = {
  title: "Restaurante & Bar",
  description:
    "Sabores, bebidas, ambiente e experiências para momentos especiais no Chocolate com Pimenta.",
};

export const dynamic = "force-dynamic";

export default function RestaurantePage() {
  return (
    <CarrinhoProvider>
      <RestauranteHero />
      <MenuSection />
      <CombosSection />
      <CarrinhoFlutuante />
    </CarrinhoProvider>
  );
}
