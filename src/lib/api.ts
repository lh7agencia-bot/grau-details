import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AdminOverviewData,
  AdminUser,
  ContactMessage,
  FaqItem,
  GalleryPhoto,
  SiteDataSnapshot,
  Testimonial,
} from '../types';

const TOKEN_STORAGE_KEY = 'gd_admin_token';

function getBrowserSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key);
}

export function getStoredAdminToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage restriction
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAdminToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errMsg = `Erro ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) errMsg = body.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errMsg);
  }

  return (await res.json()) as T;
}

export async function fetchSiteData(): Promise<SiteDataSnapshot> {
  try {
    return await apiFetch<SiteDataSnapshot>('/api/site-data');
  } catch (err) {
    const sb = getBrowserSupabase();
    if (!sb) throw err;
    const [galleryRes, testimonialsRes, faqsRes] = await Promise.all([
      sb.from('gallery_photos').select('*').order('display_order', { ascending: true }),
      sb.from('testimonials').select('*').eq('status', 'aprovado').order('created_at', { ascending: false }),
      sb.from('faqs').select('*').order('display_order', { ascending: true }),
    ]);
    return {
      gallery: (galleryRes.data as GalleryPhoto[]) ?? [],
      testimonials: (testimonialsRes.data as Testimonial[]) ?? [],
      faqs: (faqsRes.data as FaqItem[]) ?? [],
    };
  }
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  try {
    return await apiFetch<ContactMessage>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const sb = getBrowserSupabase();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('contact_messages')
      .insert({ ...payload, is_read: false })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as ContactMessage;
  }
}

export async function submitPublicTestimonial(payload: {
  author_name: string;
  content: string;
  rating: number;
}): Promise<Testimonial> {
  try {
    return await apiFetch<Testimonial>('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const sb = getBrowserSupabase();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('testimonials')
      .insert({ ...payload, status: 'pendente' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Testimonial;
  }
}

// --- Admin Auth & Overview ---
export async function loginAdmin(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
  const result = await apiFetch<{ user: AdminUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredAdminToken(result.token);
  return result;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } finally {
    setStoredAdminToken(null);
  }
}

export async function checkAdminSession(): Promise<AdminUser | null> {
  try {
    const res = await apiFetch<{ authenticated: boolean; user?: AdminUser }>('/api/auth/session');
    return res.authenticated && res.user ? res.user : null;
  } catch {
    return null;
  }
}

export async function fetchAdminOverview(): Promise<AdminOverviewData> {
  return apiFetch<AdminOverviewData>('/api/admin/overview');
}

export async function uploadGalleryImage(filename: string, dataUrl: string): Promise<{ url: string }> {
  return apiFetch<{ url: string }>('/api/admin/upload', {
    method: 'POST',
    body: JSON.stringify({ filename, dataUrl }),
  });
}

// Gallery CRUD
export async function adminCreateGalleryPhoto(payload: {
  image_url: string;
  caption: string;
  display_order?: number;
}): Promise<GalleryPhoto> {
  return apiFetch<GalleryPhoto>('/api/admin/gallery', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateGalleryPhoto(
  id: string,
  patch: Partial<Pick<GalleryPhoto, 'image_url' | 'caption' | 'display_order'>>
): Promise<GalleryPhoto> {
  return apiFetch<GalleryPhoto>(`/api/admin/gallery/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function adminDeleteGalleryPhoto(id: string): Promise<void> {
  await apiFetch(`/api/admin/gallery/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Testimonials CRUD
export async function adminCreateTestimonial(payload: {
  author_name: string;
  content: string;
  rating: number;
  status: 'aprovado' | 'pendente';
}): Promise<Testimonial> {
  return apiFetch<Testimonial>('/api/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateTestimonial(
  id: string,
  patch: Partial<Pick<Testimonial, 'author_name' | 'content' | 'rating' | 'status'>>
): Promise<Testimonial> {
  return apiFetch<Testimonial>(`/api/admin/testimonials/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function adminDeleteTestimonial(id: string): Promise<void> {
  await apiFetch(`/api/admin/testimonials/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// Messages CRUD
export async function adminUpdateMessage(id: string, is_read: boolean): Promise<ContactMessage> {
  return apiFetch<ContactMessage>(`/api/admin/messages/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_read }),
  });
}

export async function adminDeleteMessage(id: string): Promise<void> {
  await apiFetch(`/api/admin/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// FAQ CRUD
export async function adminCreateFaq(payload: {
  question: string;
  answer: string;
  display_order?: number;
}): Promise<FaqItem> {
  return apiFetch<FaqItem>('/api/admin/faqs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateFaq(
  id: string,
  patch: Partial<Pick<FaqItem, 'question' | 'answer' | 'display_order'>>
): Promise<FaqItem> {
  return apiFetch<FaqItem>(`/api/admin/faqs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function adminDeleteFaq(id: string): Promise<void> {
  await apiFetch(`/api/admin/faqs/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
