import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageSquarePlus, Star, X } from 'lucide-react';
import type { Testimonial } from '../types';
import { submitPublicTestimonial } from '../lib/api';
import { validateTestimonialForm } from '../utils/siteLogic';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loading: boolean;
}

export function TestimonialsSection({ testimonials, loading }: TestimonialsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validation = validateTestimonialForm({
      author_name: authorName,
      content,
      rating,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await submitPublicTestimonial({
        author_name: authorName.trim(),
        content: content.trim(),
        rating,
      });
      setSubmitMessage(
        'Avaliação enviada com sucesso! Ela ficará visível no site após aprovação da nossa equipe.'
      );
      setAuthorName('');
      setContent('');
      setRating(5);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível enviar sua avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="depoimentos" className="border-b border-white/10 bg-[#1A1A1A] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#C77DFF]">
              Depoimentos
            </p>
            <h2
              className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              O que nossos clientes dizem
            </h2>
          </div>

          <motion.button
            type="button"
            onClick={() => {
              setSubmitMessage(null);
              setSubmitError(null);
              setModalOpen(true);
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#222226] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#7B2CBF] hover:bg-[#2A2A30] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF]"
          >
            <MessageSquarePlus className="h-4 w-4 text-[#C77DFF]" aria-hidden="true" />
            <span>Avaliar Atendimento</span>
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-white/10 bg-[#222226]"
              />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#222226] p-10 text-center">
            <p className="text-base font-medium text-white">
              Nenhum depoimento aprovado ainda.
            </p>
            <p className="mt-1 text-sm text-[#9A9AA6]">
              Seja o primeiro a avaliar o cuidado da Grau Details.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {testimonials.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(idx * 0.08, 0.28),
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -3 }}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#222226] p-6 transition-colors hover:border-[#7B2CBF]/60"
              >
                <div>
                  <div
                    className="flex items-center gap-1"
                    aria-label={`Avaliação: ${item.rating} de 5 estrelas`}
                  >
                    {Array.from({ length: 5 }).map((_, starIdx) => {
                      const active = starIdx < item.rating;
                      return (
                        <Star
                          key={starIdx}
                          className={`h-4 w-4 ${
                            active
                              ? 'fill-[#C77DFF] text-[#C77DFF]'
                              : 'text-white/20'
                          }`}
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>
                  <p className="mt-4 text-base leading-relaxed text-[#E8E8EF]">
                    “{item.content}”
                  </p>
                </div>

                <p className="mt-6 text-sm font-semibold text-white">
                  {item.author_name}
                </p>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* Modal to submit a new review (status: pendente) */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#1D1D21] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 id="review-modal-title" className="font-display text-xl font-bold text-white">
                  Avaliar nosso atendimento
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label="Fechar formulário de avaliação"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#25252B] text-white hover:border-[#7B2CBF]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {submitMessage ? (
                <div className="mt-6 rounded-xl border border-[#7B2CBF]/40 bg-[#7B2CBF]/15 p-5">
                  <p className="text-sm font-medium leading-relaxed text-white">
                    {submitMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#7B2CBF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8E3FD6]"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="review-author"
                      className="block text-sm font-medium text-[#D6D6DF]"
                    >
                      Seu nome e veículo (opcional)
                    </label>
                    <input
                      id="review-author"
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ex.: João Paulo · Civic"
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3.5 py-2.5 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
                    />
                    {errors.author_name && (
                      <p className="mt-1 text-xs text-rose-400">{errors.author_name}</p>
                    )}
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-[#D6D6DF]">
                      Sua nota
                    </span>
                    <div className="mt-1.5 flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          aria-label={`Nota ${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#141416] transition-colors hover:border-[#7B2CBF]"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              value <= rating
                                ? 'fill-[#C77DFF] text-[#C77DFF]'
                                : 'text-white/25'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p className="mt-1 text-xs text-rose-400">{errors.rating}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="review-content"
                      className="block text-sm font-medium text-[#D6D6DF]"
                    >
                      Seu depoimento
                    </label>
                    <textarea
                      id="review-content"
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Conte como foi o cuidado com seu carro ou moto..."
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3.5 py-2.5 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
                    />
                    {errors.content && (
                      <p className="mt-1 text-xs text-rose-400">{errors.content}</p>
                    )}
                  </div>

                  {submitError && (
                    <p className="text-sm text-rose-400" role="alert">
                      {submitError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[#D6D6DF] hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-[#7B2CBF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8E3FD6] disabled:opacity-60"
                    >
                      {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
