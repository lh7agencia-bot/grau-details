import { Lock } from 'lucide-react';
import {
  buildWhatsAppUrl,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_SLOGAN,
} from '../utils/siteLogic';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-[#121214] py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-white">{BUSINESS_NAME}</p>
          <p className="mt-1 text-sm text-[#9A9AA6]">
            {BUSINESS_SLOGAN} · WhatsApp{' '}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D6D6DF] underline-offset-4 hover:text-[#C77DFF] hover:underline tabular-nums"
            >
              {BUSINESS_PHONE_DISPLAY}
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#9A9AA6]">
          <a href="#servicos" className="transition-colors hover:text-white">
            Serviços
          </a>
          <a href="#galeria" className="transition-colors hover:text-white">
            Galeria
          </a>
          <a href="#depoimentos" className="transition-colors hover:text-white">
            Depoimentos
          </a>
          <a href="#faq" className="transition-colors hover:text-white">
            Dúvidas
          </a>
          <a href="#contato" className="transition-colors hover:text-white">
            Contato
          </a>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 font-medium text-[#C77DFF] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF] rounded-sm"
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Painel Administrativo</span>
          </button>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 px-4 pt-6 sm:px-6">
        <p className="text-xs text-[#7E7E8A]">
          © {new Date().getFullYear()} {BUSINESS_NAME}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
