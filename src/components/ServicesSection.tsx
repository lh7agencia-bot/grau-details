import { motion } from 'motion/react';

const SERVICES = [
  {
    number: '01.',
    title: 'Lavagem Técnica Detalhada',
    description:
      'Pré-lavagem espumosa de pH neutro, limpeza minuciosa de caixas de roda, emblemas, grades e cantos com pincéis macios para eliminar sujeiras sem agredir o verniz.',
  },
  {
    number: '02.',
    title: 'Revitalização e Proteção de Pintura',
    description:
      'Aplicação de ceras de carnaúba e selantes profissionais que devolvem profundidade de brilho, toque liso e proteção contra sol e chuva.',
  },
  {
    number: '03.',
    title: 'Condicionamento de Plásticos e Pneus',
    description:
      'Tratamento específico para plásticos externos, borrachas e pneus com acabamento acetinado, seco ao toque e livre de aspecto engordurado.',
  },
  {
    number: '04.',
    title: 'Estética Especializada para Motos e Projetos',
    description:
      'Cuidado sob medida para motocicletas de rua ou big trail, carros rebaixados e veículos especiais, preservando partes elétricas, alumínio e rodas personalizadas.',
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="border-b border-white/10 bg-[#1A1A1A] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-sm font-semibold tracking-wide text-[#C77DFF]">
              Padrão de Estúdio
            </p>
            <h2
              className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Cada veículo recebe tratamento técnico, não lavagem apressada.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#B4B4BE]">
              Trabalhamos com linhas profissionais de estética automotiva para garantir limpeza
              profunda, conservação dos materiais originais e brilho duradouro desde o primeiro
              atendimento.
            </p>
          </motion.div>

          <div className="lg:col-span-7 divide-y divide-white/10 border-t border-b border-white/10">
            {SERVICES.map((service, index) => (
              <motion.article
                key={service.number}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group py-6 transition-colors first:pt-6 last:pb-6"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-lg font-bold text-[#C77DFF] tabular-nums shrink-0">
                    {service.number}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white transition-colors group-hover:text-[#C77DFF]">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#B4B4BE] sm:text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
