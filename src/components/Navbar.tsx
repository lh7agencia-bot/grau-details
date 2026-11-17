import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { buildWhatsAppUrl, BUSINESS_SHORT_NAME } from '../utils/siteLogic';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const whatsappHref = buildWhatsAppUrl();

  const navLinks = [
    { href: '#servicos', label: 'Serviços' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#depoimentos', label: 'Depoimentos' },
    { href: '#faq', label: 'Dúvidas' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1A1A1A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#inicio"
          className="font-display text-xl font-bold tracking-tight text-white transition-colors hover:text-[#C77DFF] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF] rounded-sm"
        >
          {BUSINESS_SHORT_NAME}
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#B4B4BE] transition-colors duration-200 hover:text-white underline-offset-4 hover:underline whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF] rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#7B2CBF] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#8E3FD6] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]"
          >
            Agendar Horário
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#222226] text-white transition-colors hover:border-[#7B2CBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#1A1A1A] px-4 py-4 md:hidden">
          <nav aria-label="Navegação mobile" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-[#E4E4EA] transition-colors hover:bg-[#222226] hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#7B2CBF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8E3FD6]"
            >
              Agendar pelo WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
