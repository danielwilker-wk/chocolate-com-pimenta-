import { MapPin, Phone, Clock, Mail } from "lucide-react";
import ContactoForm from "@/components/contactos/contacto-form";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Contactos",
  description: "Entre em contacto com a Chocolate com Pimenta.",
};

export default function ContactosPage() {
  return (
    <div className="pt-32 md:pt-40 pb-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            Fale connosco
          </p>
          <h1 className="font-display text-3xl md:text-5xl">Contactos</h1>
        </div>

        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-16">
          <div className="space-y-6">
            <InfoItem icon={<Phone size={18} />} label="Telefone">
              {siteConfig.contacts.phone}
            </InfoItem>
            <InfoItem icon={<Mail size={18} />} label="Email">
              {siteConfig.contacts.email}
            </InfoItem>
            <InfoItem icon={<MapPin size={18} />} label="Endereço">
              {siteConfig.contacts.address}
            </InfoItem>
            <InfoItem icon={<Clock size={18} />} label="Horário">
              {siteConfig.contacts.hours}
            </InfoItem>
          </div>

          <ContactoForm />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-gold mt-1 shrink-0">{icon}</div>
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-mist mb-1">
          {label}
        </p>
        <p className="text-paper">{children}</p>
      </div>
    </div>
  );
}
