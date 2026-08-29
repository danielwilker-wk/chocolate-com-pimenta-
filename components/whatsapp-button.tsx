"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig, buildWhatsAppLink } from "@/lib/site-config";

export default function WhatsAppButton() {
  const link = buildWhatsAppLink(
    siteConfig.whatsapp.geral,
    "Olá, Chocolate com Pimenta. Gostaria de obter informações sobre..."
  );

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar via WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-ink flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform duration-300"
    >
      <MessageCircle size={26} fill="currentColor" strokeWidth={0} />
    </a>
  );
}
