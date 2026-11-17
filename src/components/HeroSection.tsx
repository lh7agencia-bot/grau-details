import { motion } from 'motion/react';
import { ArrowRight, Phone } from 'lucide-react';
import {
  buildWhatsAppUrl,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_SLOGAN,
} from '../utils/siteLogic';

export function HeroSection() {
  const whatsappUrl = buildWhatsAppUrl();

  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-white/10 bg-[#141416] pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28"
    >
      {/* Subtle studio ambient glow in Deep Purple */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-[#7B2CBF]/18 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
        {/* Left Copy Column */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6"
        >
          <p className="text-sm font-semibold tracking-wide text-[#C77DFF]">
            {BUSINESS_NAME}
          </p>

          <h1
            className="mt-3 font-display font-extrabold tracking-tight text-white"
            style={{
              fontSize: 'clamp(2.35rem, 4.4vw, 3.85rem)',
              lineHeight: 1.06,
              textWrap: 'balance',
            }}
          >
            {BUSINESS_SLOGAN}.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#B4B4BE] sm:text-lg">
            Lava jato e estética automotiva dedicada ao acabamento de alto padrão. Cuidamos da
            lavagem técnica, revitalização e proteção de carros e motos com produtos profissionais e
            atenção a cada detalhe.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#7B2CBF] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7B2CBF]/25 transition-colors hover:bg-[#8E3FD6] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416]"
            >
              <span>Agendar pelo WhatsApp</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </motion.a>

            <motion.a
              href="#galeria"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-[#1F1F24] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-[#7B2CBF] hover:bg-[#26262C] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF]"
            >
              Ver Galeria de Serviços
            </motion.a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#9A9AA6]">
            <span className="inline-flex items-center gap-2 font-medium text-[#D6D6DF]">
              <Phone className="h-4 w-4 text-[#C77DFF]" aria-hidden="true" />
              <span className="tabular-nums">{BUSINESS_PHONE_DISPLAY}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Lavagem técnica para carros e motos</span>
            <span aria-hidden="true">·</span>
            <span>Atendimento com hora marcada</span>
          </div>
        </motion.div>

        {/* Right Visual Showcase Column */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6"
        >
          <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Official Logo Card (1:1 original proportion) */}
            <div className="col-span-12 sm:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#0A0A0C] p-2.5 shadow-2xl shadow-black/50">
                <img
                  src="/images/logo-grau-details.jpeg"
                  alt="Emblema oficial Grau Details Estética Automotiva"
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full rounded-xl object-contain bg-black"
                />
              </div>
            </div>

            {/* Real Studio Photo Preview Stack (Preserving vertical proportions) */}
            <div className="col-span-12 sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-4">
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#1E1E22]">
                <img
                  src="/images/galeria-land-rover.jpeg"
                  alt="Land Rover Discovery após lavagem técnica na Grau Details"
                  referrerPolicy="no-referrer"
                  className="aspect-[3/4] sm:aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#1E1E22]">
                <img
                  src="/images/galeria-moto-cb300f.jpeg"
                  alt="Motocicleta Honda CB 300F detalhada com produtos automotivos na Grau Details"
                  referrerPolicy="no-referrer"
                  className="aspect-[3/4] sm:aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
