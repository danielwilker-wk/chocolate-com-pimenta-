import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { InstagramIcon, FacebookIcon } from "@/components/icons/brand-icons";

export default function Footer() {
  return (
    <footer className="bg-black-secondary bg-ink-soft border-t border-white/5 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] mb-14">
          <div>
            <p className="font-display text-2xl tracking-[0.08em] mb-4">
              CHOCOLATE <span className="text-gold">COM PIMENTA</span>
            </p>
            <p className="text-mist text-sm max-w-xs leading-relaxed">
              {siteConfig.tagline}
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={siteConfig.social.instagram}
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-mist hover:text-gold hover:border-gold transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={siteConfig.social.facebook}
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-mist hover:text-gold hover:border-gold transition-colors"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.geral.replace(/[^\d]/g, "")}`}
                aria-label="WhatsApp"
                className="w-10 h-10 flex items-center justify-center border border-white/15 text-mist hover:text-gold hover:border-gold transition-colors"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] text-gold uppercase mb-5">
              Navegação
            </p>
            <ul className="space-y-3">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-mist hover:text-paper transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] text-gold uppercase mb-5">
              Contacto
            </p>
            <ul className="space-y-3 text-sm text-mist">
              <li>{siteConfig.contacts.phone}</li>
              <li>{siteConfig.contacts.email}</li>
              <li>{siteConfig.contacts.address}</li>
              <li>{siteConfig.contacts.hours}</li>
            </ul>
          </div>
        </div>

        <div className="hairline mb-6" />

        <p className="text-xs text-mist/70 text-center">
          © 2026 Chocolate com Pimenta. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
