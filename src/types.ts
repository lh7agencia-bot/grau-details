export interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string;
  display_order: number;
  created_at: string;
}

export type TestimonialStatus = 'aprovado' | 'pendente';

export interface Testimonial {
  id: string;
  author_name: string;
  content: string;
  rating: number;
  status: TestimonialStatus;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface AdminUser {
  email: string;
}

export interface SiteDataSnapshot {
  gallery: GalleryPhoto[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
}

export interface AdminOverviewData {
  gallery: GalleryPhoto[];
  testimonials: Testimonial[];
  messages: ContactMessage[];
  faqs: FaqItem[];
  storageMode: 'supabase' | 'local';
}
