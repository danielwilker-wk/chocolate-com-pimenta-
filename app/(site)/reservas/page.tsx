import ReservaForm from "@/components/reservas/reserva-form";

export const metadata = {
  title: "Reservas",
  description: "Faça a sua reserva no restaurante Chocolate com Pimenta.",
};

export default function ReservasPage() {
  return (
    <div className="pt-32 md:pt-40 pb-24 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Restaurante & Bar
          </p>
          <h1 className="font-display text-3xl md:text-5xl mb-4">
            Faça a sua reserva
          </h1>
          <p className="text-mist">
            Preencha os dados abaixo. Entraremos em contacto para confirmar.
          </p>
        </div>
        <ReservaForm />
      </div>
    </div>
  );
}
