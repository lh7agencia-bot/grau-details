import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  createContactMessage,
  createFaq,
  createGalleryPhoto,
  createSessionToken,
  createTestimonial,
  deleteContactMessage,
  deleteFaq,
  deleteGalleryPhoto,
  deleteTestimonial,
  getStorageMode,
  listContactMessages,
  listFaqs,
  listGalleryPhotos,
  listTestimonials,
  updateContactMessage,
  updateFaq,
  updateGalleryPhoto,
  updateTestimonial,
  verifyAdminCredentials,
  verifySessionToken,
} from './server/db';
import { validateContactForm, validateTestimonialForm } from './src/utils/siteLogic';

const PORT = Number(process.env.PORT) || 3000;
const COOKIE_NAME = 'gd_admin_session';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const val = decodeURIComponent(pair.slice(idx + 1).trim());
    acc[key] = val;
    return acc;
  }, {});
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME] || null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const session = verifySessionToken(token);
  if (!session) {
    res.status(401).json({ error: 'Sessão administrativa expirada ou não autenticada.' });
    return;
  }
  (req as Request & { adminUser?: { email: string } }).adminUser = session;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const publicImagesDir = path.resolve(process.cwd(), 'public/images');
  const uploadsDir = path.join(publicImagesDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Always serve /images directly from public/images so uploaded images work immediately
  app.use('/images', express.static(publicImagesDir));

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: getStorageMode() });
  });

  // --- Public Site Data ---
  app.get('/api/site-data', async (_req, res) => {
    try {
      const [gallery, testimonials, faqs] = await Promise.all([
        listGalleryPhotos(),
        listTestimonials(true),
        listFaqs(),
      ]);
      res.json({ gallery, testimonials, faqs });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao carregar dados.' });
    }
  });

  app.get('/api/gallery', async (_req, res) => {
    try {
      res.json(await listGalleryPhotos());
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao carregar galeria.' });
    }
  });

  app.get('/api/testimonials', async (_req, res) => {
    try {
      res.json(await listTestimonials(true));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao carregar depoimentos.' });
    }
  });

  app.post('/api/testimonials', async (req, res) => {
    try {
      const { author_name = '', content = '', rating = 5 } = req.body ?? {};
      const validation = validateTestimonialForm({
        author_name: String(author_name),
        content: String(content),
        rating: Number(rating),
      });
      if (!validation.valid) {
        res.status(400).json({ error: 'Dados inválidos.', errors: validation.errors });
        return;
      }
      const created = await createTestimonial({
        author_name: String(author_name),
        content: String(content),
        rating: Number(rating),
        status: 'pendente',
      });
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao enviar avaliação.' });
    }
  });

  app.get('/api/faqs', async (_req, res) => {
    try {
      res.json(await listFaqs());
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao carregar FAQ.' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const { name = '', email = '', message = '' } = req.body ?? {};
      const validation = validateContactForm({
        name: String(name),
        email: String(email),
        message: String(message),
      });
      if (!validation.valid) {
        res.status(400).json({ error: 'Verifique os campos preenchidos.', errors: validation.errors });
        return;
      }
      const saved = await createContactMessage({
        name: String(name),
        email: String(email),
        message: String(message),
      });
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao enviar mensagem.' });
    }
  });

  // --- Admin Authentication ---
  app.post('/api/auth/login', (req, res) => {
    const { email = '', password = '' } = req.body ?? {};
    if (!verifyAdminCredentials(String(email), String(password))) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const token = createSessionToken(cleanEmail);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ user: { email: cleanEmail }, token });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  });

  app.get('/api/auth/session', (req, res) => {
    const token = extractToken(req);
    const session = verifySessionToken(token);
    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, user: session });
  });

  // --- Protected Admin Endpoints ---
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const [gallery, testimonials, messages, faqs] = await Promise.all([
        listGalleryPhotos(),
        listTestimonials(false),
        listContactMessages(),
        listFaqs(),
      ]);
      res.json({
        gallery,
        testimonials,
        messages,
        faqs,
        storageMode: getStorageMode(),
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao carregar painel.' });
    }
  });

  // Image upload to public/images/uploads/
  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    try {
      const { filename = 'foto.jpg', dataUrl = '' } = req.body ?? {};
      const match = String(dataUrl).match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
      if (!match) {
        res.status(400).json({ error: 'Formato de imagem inválido. Envie PNG, JPEG ou WebP.' });
        return;
      }
      const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
      const safeBase = path
        .basename(String(filename), path.extname(String(filename)))
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .slice(0, 40);
      const finalName = `${safeBase || 'foto'}-${crypto.randomUUID().slice(0, 6)}.${ext}`;
      const targetPath = path.join(uploadsDir, finalName);
      fs.writeFileSync(targetPath, Buffer.from(match[2], 'base64'));
      res.status(201).json({ url: `/images/uploads/${finalName}` });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao salvar imagem.' });
    }
  });

  // Gallery Admin CRUD
  app.post('/api/admin/gallery', requireAdmin, async (req, res) => {
    try {
      const { image_url = '', caption = '', display_order } = req.body ?? {};
      if (!String(image_url).trim() || !String(caption).trim()) {
        res.status(400).json({ error: 'Imagem e legenda são obrigatórias.' });
        return;
      }
      const created = await createGalleryPhoto({
        image_url: String(image_url),
        caption: String(caption),
        display_order: display_order !== undefined ? Number(display_order) : undefined,
      });
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao adicionar foto.' });
    }
  });

  app.patch('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await updateGalleryPhoto(req.params.id, req.body ?? {});
      if (!updated) {
        res.status(404).json({ error: 'Foto não encontrada.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao atualizar foto.' });
    }
  });

  app.delete('/api/admin/gallery/:id', requireAdmin, async (req, res) => {
    try {
      const ok = await deleteGalleryPhoto(req.params.id);
      if (!ok) {
        res.status(404).json({ error: 'Foto não encontrada.' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao excluir foto.' });
    }
  });

  // Testimonials Admin CRUD
  app.post('/api/admin/testimonials', requireAdmin, async (req, res) => {
    try {
      const { author_name = '', content = '', rating = 5, status = 'aprovado' } = req.body ?? {};
      const validation = validateTestimonialForm({
        author_name: String(author_name),
        content: String(content),
        rating: Number(rating),
      });
      if (!validation.valid) {
        res.status(400).json({ error: 'Dados do depoimento inválidos.', errors: validation.errors });
        return;
      }
      const created = await createTestimonial({
        author_name: String(author_name),
        content: String(content),
        rating: Number(rating),
        status: status === 'pendente' ? 'pendente' : 'aprovado',
      });
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao criar depoimento.' });
    }
  });

  app.patch('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await updateTestimonial(req.params.id, req.body ?? {});
      if (!updated) {
        res.status(404).json({ error: 'Depoimento não encontrado.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao atualizar depoimento.' });
    }
  });

  app.delete('/api/admin/testimonials/:id', requireAdmin, async (req, res) => {
    try {
      const ok = await deleteTestimonial(req.params.id);
      if (!ok) {
        res.status(404).json({ error: 'Depoimento não encontrado.' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao excluir depoimento.' });
    }
  });

  // Messages Admin CRUD
  app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await updateContactMessage(req.params.id, req.body ?? {});
      if (!updated) {
        res.status(404).json({ error: 'Mensagem não encontrada.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao atualizar mensagem.' });
    }
  });

  app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    try {
      const ok = await deleteContactMessage(req.params.id);
      if (!ok) {
        res.status(404).json({ error: 'Mensagem não encontrada.' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao excluir mensagem.' });
    }
  });

  // FAQ Admin CRUD
  app.post('/api/admin/faqs', requireAdmin, async (req, res) => {
    try {
      const { question = '', answer = '', display_order } = req.body ?? {};
      if (!String(question).trim() || !String(answer).trim()) {
        res.status(400).json({ error: 'Pergunta e resposta são obrigatórias.' });
        return;
      }
      const created = await createFaq({
        question: String(question),
        answer: String(answer),
        display_order: display_order !== undefined ? Number(display_order) : undefined,
      });
      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao adicionar pergunta.' });
    }
  });

  app.patch('/api/admin/faqs/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await updateFaq(req.params.id, req.body ?? {});
      if (!updated) {
        res.status(404).json({ error: 'Pergunta não encontrada.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao atualizar pergunta.' });
    }
  });

  app.delete('/api/admin/faqs/:id', requireAdmin, async (req, res) => {
    try {
      const ok = await deleteFaq(req.params.id);
      if (!ok) {
        res.status(404).json({ error: 'Pergunta não encontrada.' });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erro ao excluir pergunta.' });
    }
  });

  // Frontend Serving (Vite dev middleware vs production dist)
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Grau Details server running at http://localhost:${PORT}`);
  });
}

startServer();
