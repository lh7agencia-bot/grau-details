import type { FaqItem, GalleryPhoto, Testimonial } from '../types';

export const BUSINESS_NAME = 'Grau Details Estética Automotiva';
export const BUSINESS_SHORT_NAME = 'Grau Details';
export const BUSINESS_SLOGAN = 'Seu carro, nosso cuidado';
export const BUSINESS_PHONE_RAW = '62981841323';
export const BUSINESS_PHONE_DISPLAY = '(62) 98184-1323';

export function buildWhatsAppUrl(
  message = 'Olá! Vim pelo site da Grau Details Estética Automotiva e gostaria de agendar um horário.',
  phoneRaw = BUSINESS_PHONE_RAW
): string {
  const digits = phoneRaw.replace(/\D/g, '');
  const fullNumber = digits.startsWith('55') ? digits : `55${digits}`;
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${fullNumber}?text=${encoded}`;
}

export function normalizeImagePath(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '/images/logo-grau-details.jpeg';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  if (trimmed.startsWith('/images/')) {
    return trimmed;
  }
  if (trimmed.startsWith('images/')) {
    return `/${trimmed}`;
  }
  if (trimmed.startsWith('/public/images/')) {
    return trimmed.replace(/^\/public/, '');
  }
  if (trimmed.startsWith('public/images/')) {
    return `/${trimmed.replace(/^public\//, '')}`;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactForm(input: {
  name: string;
  email: string;
  message: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (name.length < 2) {
    errors.name = 'Informe seu nome completo (mínimo 2 caracteres).';
  }
  if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Informe um endereço de e-mail válido.';
  }
  if (message.length < 10) {
    errors.message = 'Escreva uma mensagem com pelo menos 10 caracteres.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateTestimonialForm(input: {
  author_name: string;
  content: string;
  rating: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const authorName = input.author_name.trim();
  const content = input.content.trim();

  if (authorName.length < 2) {
    errors.author_name = 'Informe seu nome.';
  }
  if (content.length < 10) {
    errors.content = 'Conte como foi sua experiência (mínimo 10 caracteres).';
  }
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.rating = 'Escolha uma nota entre 1 e 5 estrelas.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sortByDisplayOrder<T extends { display_order: number; created_at?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    return (a.created_at ?? '').localeCompare(b.created_at ?? '');
  });
}

export function filterApprovedTestimonials(items: Testimonial[]): Testimonial[] {
  return items.filter((item) => item.status === 'aprovado');
}

export function sortGalleryPhotos(items: GalleryPhoto[]): GalleryPhoto[] {
  return sortByDisplayOrder(items);
}

export function sortFaqItems(items: FaqItem[]): FaqItem[] {
  return sortByDisplayOrder(items);
}

export function formatDatePtBr(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
