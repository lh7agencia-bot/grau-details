import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from 'lucide-react';
import type { GalleryPhoto } from '../types';
import { normalizeImagePath, sortGalleryPhotos } from '../utils/siteLogic';

interface GallerySectionProps {
  photos: GalleryPhoto[];
  loading: boolean;
}

export function GallerySection({ photos, loading }: GallerySectionProps) {
  const orderedPhotos = sortGalleryPhotos(photos);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [brokenIds, setBrokenIds] = useState<Record<string, boolean>>({});

  const activePhoto = activeIndex !== null ? orderedPhotos[activeIndex] ?? null : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % orderedPhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + orderedPhotos.length) % orderedPhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, orderedPhotos.length]);

  const handleNext = () => {
    if (activeIndex === null || orderedPhotos.length === 0) return;
    setActiveIndex((activeIndex + 1) % orderedPhotos.length);
  };

  const handlePrev = () => {
    if (activeIndex === null || orderedPhotos.length === 0) return;
    setActiveIndex((activeIndex - 1 + orderedPhotos.length) % orderedPhotos.length);
  };

  return (
    <section id="galeria" className="border-b border-white/10 bg-[#141416] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#C77DFF]">
              Galeria do Estúdio
            </p>
            <h2
              className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Resultados reais no nosso estúdio
            </h2>
          </div>
          <p className="text-sm text-[#9A9AA6]">
            Clique em qualquer foto para ampliar em tela cheia
          </p>
        </motion.div>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-white/10 bg-[#222226]"
              />
            ))}
          </div>
        ) : orderedPhotos.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#1E1E22] p-10 text-center">
            <p className="text-base font-medium text-white">
              Nenhuma foto cadastrada na galeria ainda.
            </p>
            <p className="mt-1 text-sm text-[#9A9AA6]">
              Adicione novas fotos pelo Painel Administrativo.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orderedPhotos.map((photo, index) => {
              const src = normalizeImagePath(photo.image_url);
              const isBroken = Boolean(brokenIds[photo.id]);
              return (
                <motion.button
                  key={photo.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ampliar foto: ${photo.caption}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(index * 0.05, 0.3),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E22] text-left transition-colors hover:border-[#7B2CBF]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF]"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18181B]">
                    {isBroken ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#232329] to-[#17171B] p-6 text-center">
                        <ImageOff className="h-8 w-8 text-[#9A9AA6]" aria-hidden="true" />
                        <span className="text-xs font-medium text-[#B4B4BE]">
                          {photo.caption}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={src}
                        alt={photo.caption}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenIds((prev) => ({ ...prev, [photo.id]: true }))
                        }
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    )}

                    {/* Measured contrast gradient overlay */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent"
                    />

                    {/* Subtle expand indicator */}
                    <span
                      aria-hidden="true"
                      className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
                    >
                      <Expand className="h-4 w-4" />
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && activeIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Visualização ampliada: ${activePhoto.caption}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#161619]"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
                <span className="text-xs font-semibold tracking-wide text-[#C77DFF] tabular-nums">
                  Foto {activeIndex + 1} de {orderedPhotos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  aria-label="Fechar visualização da foto"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#222226] text-white transition-colors hover:border-[#7B2CBF] hover:bg-[#7B2CBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Image Area preserving original proportions */}
              <div className="relative flex flex-1 items-center justify-center bg-black p-2 sm:p-4">
                <img
                  src={normalizeImagePath(activePhoto.image_url)}
                  alt={activePhoto.caption}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
                />

                {orderedPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-sm transition-colors hover:border-[#7B2CBF] hover:bg-[#7B2CBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF]"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Próxima foto"
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-sm transition-colors hover:border-[#7B2CBF] hover:bg-[#7B2CBF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF]"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Caption Footer */}
              <div className="border-t border-white/10 bg-[#1B1B1F] px-5 py-3.5">
                <p className="text-sm font-medium text-white sm:text-base">
                  {activePhoto.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
