import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../types';
import { sortFaqItems } from '../utils/siteLogic';

interface FaqSectionProps {
  faqs: FaqItem[];
  loading: boolean;
}

export function FaqSection({ faqs, loading }: FaqSectionProps) {
  const orderedFaqs = sortFaqItems(faqs);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="border-b border-white/10 bg-[#141416] py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-sm font-semibold tracking-wide text-[#C77DFF]">
            Perguntas Frequentes
          </p>
          <h2
            className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Dúvidas comuns sobre nossos cuidados
          </h2>
        </motion.div>

        {loading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl border border-white/10 bg-[#1E1E22]"
              />
            ))}
          </div>
        ) : orderedFaqs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#1E1E22] p-8 text-center">
            <p className="text-sm text-[#B4B4BE]">
              Nenhuma pergunta frequente cadastrada no momento.
            </p>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#1B1B1F]">
            {orderedFaqs.map((faq, idx) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(idx * 0.05, 0.2),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.02] sm:px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7B2CBF]"
                  >
                    <span className="font-display text-base font-semibold text-white sm:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-[#C77DFF] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${faq.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-[#B4B4BE] sm:px-6 sm:text-base">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
