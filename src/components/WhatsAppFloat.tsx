import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl, BUSINESS_PHONE_DISPLAY } from '../utils/siteLogic';

export function WhatsAppFloat() {
  return (
    <motion.a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Conversar no WhatsApp ${BUSINESS_PHONE_DISPLAY}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="fixed right-4 bottom-4 z-40 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#7B2CBF] px-4 text-sm font-semibold text-white shadow-xl shadow-black/40 ring-1 ring-white/15 transition-colors hover:bg-[#8E3FD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF] sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline whitespace-nowrap">WhatsApp</span>
    </motion.a>
  );
}
