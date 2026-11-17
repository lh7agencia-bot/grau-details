-- Grau Details Estética Automotiva - Supabase Schema
-- Execute este script no SQL Editor do seu projeto Supabase.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Fotos da Galeria
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Depoimentos de Clientes
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('aprovado', 'pendente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Mensagens recebidas pelo Formulário de Contato
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Perguntas Frequentes (FAQ)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
CREATE POLICY "Leitura publica da galeria"
  ON public.gallery_photos FOR SELECT USING (true);

CREATE POLICY "Leitura publica de depoimentos aprovados"
  ON public.testimonials FOR SELECT USING (status = 'aprovado' OR auth.role() = 'authenticated');

CREATE POLICY "Envio publico de depoimento pendente"
  ON public.testimonials FOR INSERT WITH CHECK (status = 'pendente');

CREATE POLICY "Envio publico de mensagem de contato"
  ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Leitura publica do FAQ"
  ON public.faqs FOR SELECT USING (true);

-- Políticas de Administração (usuários autenticados / service_role)
CREATE POLICY "Admin gerencia galeria"
  ON public.gallery_photos FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin gerencia depoimentos"
  ON public.testimonials FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin gerencia mensagens"
  ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin gerencia FAQ"
  ON public.faqs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Dados iniciais (usando imagens estáticas em /public/images)
INSERT INTO public.gallery_photos (image_url, caption, display_order) VALUES
  ('/images/galeria-land-rover.jpeg', 'Land Rover Discovery — Lavagem técnica e revitalização de brilho intenso', 1),
  ('/images/galeria-corolla-branco.jpeg', 'Toyota Corolla — Acabamento espelhado e proteção de pintura', 2),
  ('/images/galeria-sw4-branca.jpeg', 'Toyota SW4 — Detalhamento completo de carroceria e caixas de roda', 3),
  ('/images/galeria-moto-cb300f.jpeg', 'Honda CB 300F Twister — Cuidado técnico com cera de carnaúba e revitalizador', 4),
  ('/images/galeria-moto-ibex.jpeg', 'Big Trail — Limpeza detalhada de motor, carenagens e rodas raiadas', 5),
  ('/images/galeria-sonata-branco.jpeg', 'Hyundai Sonata — Lavagem detalhada e tratamento de rodas esportivas', 6),
  ('/images/galeria-gol-rallye.jpeg', 'VW Gol Rallye — Cuidado especial para projetos rebaixados e rodas personalizadas', 7);
