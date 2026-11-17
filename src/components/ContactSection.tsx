import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { submitContactMessage } from '../lib/api';
import {
  buildWhatsAppUrl,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  validateContactForm,
} from '../utils/siteLogic';

export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<{
    name: string;
    email: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validation = validateContactForm({ name, email, message });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const cleanPayload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      };
      await submitContactMessage(cleanPayload);
      setSubmittedPayload(cleanPayload);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Erro ao enviar sua mensagem. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buildDirectWhatsAppLink = () => {
    const draftName = submittedPayload?.name || name.trim();
    const draftMsg = submittedPayload?.message || message.trim();
    if (draftMsg) {
      const fullText = draftName
        ? `Olá! Sou ${draftName}. ${draftMsg}`
        : draftMsg;
      return buildWhatsAppUrl(fullText);
    }
    return buildWhatsAppUrl();
  };

  return (
    <section id="contato" className="bg-[#1A1A1A] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Direct Contact Info (Strictly no invented address/map) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-sm font-semibold tracking-wide text-[#C77DFF]">
              Agendamento e Orçamento
            </p>
            <h2
              className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Fale direto com a {BUSINESS_NAME}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#B4B4BE]">
              Envie sua dúvida, solicite um orçamento ou combine o melhor horário para cuidar do
              seu carro ou moto. Sua mensagem fica registrada para nossa equipe e você também pode
              iniciar o atendimento imediato pelo WhatsApp.
            </p>

            <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#222226] p-6">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7B2CBF]/20 text-[#C77DFF]">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#9A9AA6]">Telefone / WhatsApp</p>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block font-display text-lg font-bold text-white transition-colors hover:text-[#C77DFF] tabular-nums"
                  >
                    {BUSINESS_PHONE_DISPLAY}
                  </a>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <motion.a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7B2CBF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8E3FD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Chamar no WhatsApp Agora</span>
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Validated Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-white/10 bg-[#222226] p-6 sm:p-8">
              {submittedPayload ? (
                <div className="py-4" role="status">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#7B2CBF]/20 text-[#C77DFF]">
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold text-white">
                    Mensagem enviada com sucesso
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#B4B4BE] sm:text-base">
                    Recebemos seu contato, <strong className="text-white">{submittedPayload.name}</strong>.
                    Se quiser agilizar ainda mais o atendimento, envie sua mensagem diretamente no
                    nosso WhatsApp:
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={buildDirectWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7B2CBF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8E3FD6]"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      <span>Continuar no WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmittedPayload(null)}
                      className="inline-flex items-center justify-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-[#E4E4EA]"
                      >
                        Nome
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#151518] px-4 py-3 text-sm text-white placeholder-[#7A7A86] transition-colors focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-[#E4E4EA]"
                      >
                        E-mail
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@exemplo.com"
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#151518] px-4 py-3 text-sm text-white placeholder-[#7A7A86] transition-colors focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-[#E4E4EA]"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Informe o modelo do veículo (carro ou moto) e o serviço desejado..."
                      className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#151518] px-4 py-3 text-sm text-white placeholder-[#7A7A86] transition-colors focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-rose-400">{errors.message}</p>
                    )}
                  </div>

                  {submitError && (
                    <p className="text-sm text-rose-400" role="alert">
                      {submitError}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7B2CBF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8E3FD6] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF]"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      <span>{submitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                    </motion.button>

                    <a
                      href={buildDirectWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#18181C] px-5 py-3 text-sm font-semibold text-[#E4E4EA] transition-colors hover:border-[#7B2CBF] hover:text-white"
                    >
                      <Mail className="h-4 w-4 text-[#C77DFF]" aria-hidden="true" />
                      <span>Enviar direto via WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
