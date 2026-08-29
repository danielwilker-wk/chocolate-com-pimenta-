"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function BusinessPanels() {
  return (
    <section id="negocios" className="py-24 md:py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-gold text-xs tracking-[0.3em] uppercase mb-4">
            A marca
          </p>
          <h2 className="font-display text-3xl md:text-5xl">
            Explore os nossos negócios
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-1 md:h-[560px]">
          {siteConfig.businesses.map((biz) => (
            <Link
              key={biz.id}
              href={biz.href}
              className="group relative flex-1 md:h-full h-72 overflow-hidden transition-[flex-grow] duration-500 ease-out md:hover:flex-[1.4]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url('${biz.image}')` }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/95" />

              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <div className="hairline w-10 mb-4 opacity-70" />
                <h3 className="font-display text-2xl md:text-3xl text-paper mb-3">
                  {biz.title}
                </h3>
                <p className="text-mist text-sm leading-relaxed max-w-xs mb-6 md:opacity-0 md:max-h-0 md:group-hover:opacity-100 md:group-hover:max-h-20 transition-all duration-500 overflow-hidden">
                  {biz.description}
                </p>
                <span className="inline-flex items-center gap-2 text-gold text-xs tracking-[0.15em] uppercase">
                  {biz.cta}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
