"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloqueia o scroll da página por trás do menu. Guarda a posição atual
  // e fixa o <body> nela — funciona mesmo em navegadores muito antigos,
  // ao contrário de só "overflow: hidden".
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      const topAtual = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      if (topAtual) {
        window.scrollTo(0, -parseInt(topAtual, 10) || 0);
      }
    }
  }, [open]);

  // Rede de segurança: fecha sempre que a rota muda.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-ink border-b border-white/5"
          : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center justify-between h-20 lg:h-24">
        <Link
          href="/"
          className="font-display text-xl lg:text-2xl tracking-[0.08em] text-paper"
          onClick={() => setOpen(false)}
        >
          CHOCOLATE <span className="text-gold">COM PIMENTA</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-mist hover:text-gold transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/reservas"
            className="inline-flex items-center border border-gold text-gold px-6 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-gold hover:text-ink transition-colors duration-300"
          >
            Fazer reserva
          </Link>
        </div>

        <button
          className="lg:hidden text-paper"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu — só existe no ecrã quando "open" é verdadeiro (sem
          deslizar/animar, sem depender de transform ou de unidades de
          altura modernas), para funcionar em navegadores muito antigos. */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#050505",
            zIndex: 200,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex items-center justify-between px-6 h-20">
            <Link
              href="/"
              className="font-display text-xl tracking-[0.08em] text-paper"
              onClick={() => setOpen(false)}
            >
              CHOCOLATE <span className="text-gold">COM PIMENTA</span>
            </Link>
            <button
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="text-paper"
            >
              <X size={26} />
            </button>
          </div>
          <nav className="flex flex-col px-8 pt-6 pb-10 gap-2">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-4 border-b border-white/10 text-lg font-display text-paper hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/reservas"
              onClick={() => setOpen(false)}
              className="mt-8 inline-flex justify-center items-center border border-gold text-gold px-6 py-4 text-xs tracking-[0.15em] uppercase"
            >
              Fazer reserva
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
