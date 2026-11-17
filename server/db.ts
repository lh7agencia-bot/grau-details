import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  ContactMessage,
  FaqItem,
  GalleryPhoto,
  Testimonial,
  TestimonialStatus,
} from '../src/types';
import { normalizeImagePath, sortByDisplayOrder } from '../src/utils/siteLogic';

interface DatabaseState {
  gallery_photos: GalleryPhoto[];
  testimonials: Testimonial[];
  contact_messages: ContactMessage[];
  faqs: FaqItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const SEED_DATA: DatabaseState = {
  gallery_photos: [
    {
      id: 'gal-1',
      image_url: '/images/galeria-land-rover.jpeg',
      caption: 'Land Rover Discovery — Lavagem técnica e revitalização de brilho intenso',
      display_order: 1,
      created_at: '2026-11-10T10:00:00.000Z',
    },
    {
      id: 'gal-2',
      image_url: '/images/galeria-corolla-branco.jpeg',
      caption: 'Toyota Corolla — Acabamento espelhado e proteção de pintura',
      display_order: 2,
      created_at: '2026-11-11T10:00:00.000Z',
    },
    {
      id: 'gal-3',
      image_url: '/images/galeria-sw4-branca.jpeg',
      caption: 'Toyota SW4 — Detalhamento completo de carroceria e caixas de roda',
      display_order: 3,
      created_at: '2026-11-12T10:00:00.000Z',
    },
    {
      id: 'gal-4',
      image_url: '/images/galeria-moto-cb300f.jpeg',
      caption: 'Honda CB 300F Twister — Cuidado técnico com cera de carnaúba e revitalizador',
      display_order: 4,
      created_at: '2026-11-13T10:00:00.000Z',
    },
    {
      id: 'gal-5',
      image_url: '/images/galeria-moto-ibex.jpeg',
      caption: 'Big Trail — Limpeza detalhada de motor, carenagens e rodas raiadas',
      display_order: 5,
      created_at: '2026-11-14T10:00:00.000Z',
    },
    {
      id: 'gal-6',
      image_url: '/images/galeria-sonata-branco.jpeg',
      caption: 'Hyundai Sonata — Lavagem detalhada e tratamento de rodas esportivas',
      display_order: 6,
      created_at: '2026-11-15T10:00:00.000Z',
    },
    {
      id: 'gal-7',
      image_url: '/images/galeria-gol-rallye.jpeg',
      caption: 'VW Gol Rallye — Cuidado especial para projetos rebaixados e rodas personalizadas',
      display_order: 7,
      created_at: '2026-11-16T10:00:00.000Z',
    },
  ],
  testimonials: [
    {
      id: 'test-1',
      author_name: 'Rafael Mendes · Proprietário de SUV',
      content:
        'Levei minha SUV preta e o resultado na pintura superou qualquer lavagem comum. Os plásticos externos ficaram renovados sem aspecto engordurado.',
      rating: 5,
      status: 'aprovado',
      created_at: '2026-11-10T14:20:00.000Z',
    },
    {
      id: 'test-2',
      author_name: 'Lucas Ferreira · Honda CB 300F',
      content:
        'Cuidado absurdo com cada detalhe da moto. Usam produtos específicos de estética automotiva e o acabamento no motor e nas rodas ficou impecável.',
      rating: 5,
      status: 'aprovado',
      created_at: '2026-11-12T16:45:00.000Z',
    },
    {
      id: 'test-3',
      author_name: 'Camila Andrade · Toyota Corolla',
      content:
        'Atendimento pontual pelo WhatsApp, ambiente super organizado e atenção total aos detalhes internos e externos. Recomendo de olhos fechados.',
      rating: 5,
      status: 'aprovado',
      created_at: '2026-11-14T11:10:00.000Z',
    },
    {
      id: 'test-4',
      author_name: 'Thiago Ribeiro · VW Gol Rallye',
      content:
        'Quem tem carro baixo sabe o medo de raspar ou riscar roda em lava jato comum. Na Grau Details o cuidado foi total do início ao fim.',
      rating: 5,
      status: 'aprovado',
      created_at: '2026-11-15T18:00:00.000Z',
    },
  ],
  contact_messages: [],
  faqs: [
    {
      id: 'faq-1',
      question: 'Qual a diferença da lavagem técnica para um lava jato comum?',
      answer:
        'Na lavagem técnica utilizamos pré-lavagem com shampoo neutro de alta lubrificação, luvas de microfibra macias, pincéis de detalhamento para emblemas e frestas, além de revitalizadores específicos que protegem pintura, plásticos e borrachas sem causar micro-riscos.',
      display_order: 1,
      created_at: '2026-11-10T09:00:00.000Z',
    },
    {
      id: 'faq-2',
      question: 'Vocês também atendem motocicletas?',
      answer:
        'Sim! Atendemos motos de baixa e alta cilindrada com limpeza segura de motor, relação, rodas raiadas ou de liga leve, carenagens e aplicação de proteção com cera de carnaúba e revitalizadores.',
      display_order: 2,
      created_at: '2026-11-10T09:05:00.000Z',
    },
    {
      id: 'faq-3',
      question: 'Preciso agendar horário antes de levar meu veículo?',
      answer:
        'Recomendamos agendar pelo WhatsApp (62) 98184-1323 para garantir atendimento sem espera e tempo dedicado exclusivamente ao cuidado do seu carro ou moto.',
      display_order: 3,
      created_at: '2026-11-10T09:10:00.000Z',
    },
    {
      id: 'faq-4',
      question: 'Quanto tempo dura em média uma lavagem detalhada?',
      answer:
        'O tempo varia conforme o porte e estado do veículo, geralmente entre 1h30 e 3h para lavagem técnica completa. Serviços de higienização interna profunda ou proteção de pintura podem demandar um período maior, informado na hora do agendamento.',
      display_order: 4,
      created_at: '2026-11-10T09:15:00.000Z',
    },
    {
      id: 'faq-5',
      question: 'Os produtos utilizados são seguros para pintura vitrificada ou envelopada?',
      answer:
        'Sim. Trabalhamos com shampoos de pH neutro e condicionadores profissionais seguros para vernizes originais, carros vitrificados, motos com pintura fosca e veículos personalizados.',
      display_order: 5,
      created_at: '2026-11-10T09:20:00.000Z',
    },
  ],
};

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function ensureLocalDb(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
    return structuredClone(SEED_DATA);
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DatabaseState>;
    return {
      gallery_photos: Array.isArray(parsed.gallery_photos) ? parsed.gallery_photos : SEED_DATA.gallery_photos,
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : SEED_DATA.testimonials,
      contact_messages: Array.isArray(parsed.contact_messages) ? parsed.contact_messages : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : SEED_DATA.faqs,
    };
  } catch {
    fs.writeFileSync(DB_FILE, JSON.stringify(SEED_DATA, null, 2), 'utf-8');
    return structuredClone(SEED_DATA);
  }
}

function saveLocalDb(state: DatabaseState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function getStorageMode(): 'supabase' | 'local' {
  return getSupabaseAdmin() ? 'supabase' : 'local';
}

// --- Auth Helpers ---
function getSessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() || 'grau-details-local-dev-secret-key';
}

export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: (process.env.ADMIN_EMAIL?.trim() || 'admin@graudetails.com.br').toLowerCase(),
    password: process.env.ADMIN_PASSWORD?.trim() || 'GrauDetails2026',
  };
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const creds = getAdminCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== creds.email) return false;
  const a = Buffer.from(password, 'utf-8');
  const b = Buffer.from(creds.password, 'utf-8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): { email: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  const a = Buffer.from(sig, 'utf-8');
  const b = Buffer.from(expectedSig, 'utf-8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      email?: string;
      exp?: number;
    };
    if (!parsed.email || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return { email: parsed.email };
  } catch {
    return null;
  }
}

// --- Gallery CRUD ---
export async function listGalleryPhotos(): Promise<GalleryPhoto[]> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('gallery_photos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...row,
      image_url: normalizeImagePath(row.image_url),
    }));
  }
  const db = ensureLocalDb();
  return sortByDisplayOrder(db.gallery_photos);
}

export async function createGalleryPhoto(input: {
  image_url: string;
  caption: string;
  display_order?: number;
}): Promise<GalleryPhoto> {
  const cleanUrl = normalizeImagePath(input.image_url);
  const caption = input.caption.trim();
  const sb = getSupabaseAdmin();
  if (sb) {
    const existing = await listGalleryPhotos();
    const order = input.display_order ?? existing.length + 1;
    const { data, error } = await sb
      .from('gallery_photos')
      .insert({ image_url: cleanUrl, caption, display_order: order })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const db = ensureLocalDb();
  const item: GalleryPhoto = {
    id: `gal-${crypto.randomUUID().slice(0, 8)}`,
    image_url: cleanUrl,
    caption,
    display_order: input.display_order ?? db.gallery_photos.length + 1,
    created_at: new Date().toISOString(),
  };
  db.gallery_photos.push(item);
  saveLocalDb(db);
  return item;
}

export async function updateGalleryPhoto(
  id: string,
  patch: Partial<Pick<GalleryPhoto, 'image_url' | 'caption' | 'display_order'>>
): Promise<GalleryPhoto | null> {
  const cleanPatch = {
    ...(patch.image_url !== undefined ? { image_url: normalizeImagePath(patch.image_url) } : {}),
    ...(patch.caption !== undefined ? { caption: patch.caption.trim() } : {}),
    ...(patch.display_order !== undefined ? { display_order: Number(patch.display_order) } : {}),
  };
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('gallery_photos')
      .update(cleanPatch)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const db = ensureLocalDb();
  const idx = db.gallery_photos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.gallery_photos[idx] = { ...db.gallery_photos[idx], ...cleanPatch };
  saveLocalDb(db);
  return db.gallery_photos[idx];
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('gallery_photos').delete().eq('id', id);
    return !error;
  }
  const db = ensureLocalDb();
  const before = db.gallery_photos.length;
  db.gallery_photos = db.gallery_photos.filter((p) => p.id !== id);
  if (db.gallery_photos.length === before) return false;
  saveLocalDb(db);
  return true;
}

// --- Testimonials CRUD ---
export async function listTestimonials(onlyApproved = false): Promise<Testimonial[]> {
  const sb = getSupabaseAdmin();
  if (sb) {
    let query = sb.from('testimonials').select('*').order('created_at', { ascending: false });
    if (onlyApproved) {
      query = query.eq('status', 'aprovado');
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
  const db = ensureLocalDb();
  const sorted = [...db.testimonials].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return onlyApproved ? sorted.filter((t) => t.status === 'aprovado') : sorted;
}

export async function createTestimonial(input: {
  author_name: string;
  content: string;
  rating: number;
  status?: TestimonialStatus;
}): Promise<Testimonial> {
  const status: TestimonialStatus = input.status === 'aprovado' ? 'aprovado' : 'pendente';
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('testimonials')
      .insert({
        author_name: input.author_name.trim(),
        content: input.content.trim(),
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        status,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const db = ensureLocalDb();
  const item: Testimonial = {
    id: `test-${crypto.randomUUID().slice(0, 8)}`,
    author_name: input.author_name.trim(),
    content: input.content.trim(),
    rating: Math.max(1, Math.min(5, Math.round(input.rating))),
    status,
    created_at: new Date().toISOString(),
  };
  db.testimonials.unshift(item);
  saveLocalDb(db);
  return item;
}

export async function updateTestimonial(
  id: string,
  patch: Partial<Pick<Testimonial, 'author_name' | 'content' | 'rating' | 'status'>>
): Promise<Testimonial | null> {
  const cleanPatch = {
    ...(patch.author_name !== undefined ? { author_name: patch.author_name.trim() } : {}),
    ...(patch.content !== undefined ? { content: patch.content.trim() } : {}),
    ...(patch.rating !== undefined ? { rating: Math.max(1, Math.min(5, Math.round(patch.rating))) } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
  };
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('testimonials')
      .update(cleanPatch)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const db = ensureLocalDb();
  const idx = db.testimonials.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.testimonials[idx] = { ...db.testimonials[idx], ...cleanPatch };
  saveLocalDb(db);
  return db.testimonials[idx];
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('testimonials').delete().eq('id', id);
    return !error;
  }
  const db = ensureLocalDb();
  const before = db.testimonials.length;
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  if (db.testimonials.length === before) return false;
  saveLocalDb(db);
  return true;
}

// --- Contact Messages CRUD ---
export async function listContactMessages(): Promise<ContactMessage[]> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
  const db = ensureLocalDb();
  return [...db.contact_messages].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('contact_messages')
      .insert({
        name: input.name.trim(),
        email: input.email.trim(),
        message: input.message.trim(),
        is_read: false,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const db = ensureLocalDb();
  const item: ContactMessage = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    is_read: false,
    created_at: new Date().toISOString(),
  };
  db.contact_messages.unshift(item);
  saveLocalDb(db);
  return item;
}

export async function updateContactMessage(
  id: string,
  patch: Partial<Pick<ContactMessage, 'is_read'>>
): Promise<ContactMessage | null> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('contact_messages')
      .update({ is_read: Boolean(patch.is_read) })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const db = ensureLocalDb();
  const idx = db.contact_messages.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  db.contact_messages[idx] = { ...db.contact_messages[idx], is_read: Boolean(patch.is_read) };
  saveLocalDb(db);
  return db.contact_messages[idx];
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('contact_messages').delete().eq('id', id);
    return !error;
  }
  const db = ensureLocalDb();
  const before = db.contact_messages.length;
  db.contact_messages = db.contact_messages.filter((m) => m.id !== id);
  if (db.contact_messages.length === before) return false;
  saveLocalDb(db);
  return true;
}

// --- FAQs CRUD ---
export async function listFaqs(): Promise<FaqItem[]> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
  const db = ensureLocalDb();
  return sortByDisplayOrder(db.faqs);
}

export async function createFaq(input: {
  question: string;
  answer: string;
  display_order?: number;
}): Promise<FaqItem> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const existing = await listFaqs();
    const { data, error } = await sb
      .from('faqs')
      .insert({
        question: input.question.trim(),
        answer: input.answer.trim(),
        display_order: input.display_order ?? existing.length + 1,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const db = ensureLocalDb();
  const item: FaqItem = {
    id: `faq-${crypto.randomUUID().slice(0, 8)}`,
    question: input.question.trim(),
    answer: input.answer.trim(),
    display_order: input.display_order ?? db.faqs.length + 1,
    created_at: new Date().toISOString(),
  };
  db.faqs.push(item);
  saveLocalDb(db);
  return item;
}

export async function updateFaq(
  id: string,
  patch: Partial<Pick<FaqItem, 'question' | 'answer' | 'display_order'>>
): Promise<FaqItem | null> {
  const cleanPatch = {
    ...(patch.question !== undefined ? { question: patch.question.trim() } : {}),
    ...(patch.answer !== undefined ? { answer: patch.answer.trim() } : {}),
    ...(patch.display_order !== undefined ? { display_order: Number(patch.display_order) } : {}),
  };
  const sb = getSupabaseAdmin();
  if (sb) {
    const { data, error } = await sb.from('faqs').update(cleanPatch).eq('id', id).select().single();
    if (error) return null;
    return data;
  }
  const db = ensureLocalDb();
  const idx = db.faqs.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  db.faqs[idx] = { ...db.faqs[idx], ...cleanPatch };
  saveLocalDb(db);
  return db.faqs[idx];
}

export async function deleteFaq(id: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (sb) {
    const { error } = await sb.from('faqs').delete().eq('id', id);
    return !error;
  }
  const db = ensureLocalDb();
  const before = db.faqs.length;
  db.faqs = db.faqs.filter((f) => f.id !== id);
  if (db.faqs.length === before) return false;
  saveLocalDb(db);
  return true;
}
