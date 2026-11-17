import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppUrl,
  filterApprovedTestimonials,
  normalizeImagePath,
  sortByDisplayOrder,
  validateContactForm,
  validateTestimonialForm,
} from './siteLogic';
import type { Testimonial } from '../types';

test('buildWhatsAppUrl formats Brazilian number with country code 55 and encoded text', () => {
  const url = buildWhatsAppUrl('Olá Grau Details', '6298184-1323');
  assert.equal(url, 'https://wa.me/5562981841323?text=Ol%C3%A1%20Grau%20Details');
});

test('normalizeImagePath keeps /images/* intact and fixes public/ prefix', () => {
  assert.equal(normalizeImagePath('/images/galeria-land-rover.jpeg'), '/images/galeria-land-rover.jpeg');
  assert.equal(normalizeImagePath('public/images/galeria-sw4-branca.jpeg'), '/images/galeria-sw4-branca.jpeg');
  assert.equal(normalizeImagePath('images/logo-grau-details.jpeg'), '/images/logo-grau-details.jpeg');
});

test('validateContactForm rejects invalid inputs and accepts valid data', () => {
  const invalid = validateContactForm({ name: 'A', email: 'invalid', message: 'oi' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);

  const valid = validateContactForm({
    name: 'Carlos Eduardo',
    email: 'carlos@exemplo.com',
    message: 'Gostaria de agendar uma lavagem técnica para sexta-feira.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateTestimonialForm validates rating bounds and text length', () => {
  const bad = validateTestimonialForm({ author_name: 'Jo', content: 'Bom', rating: 6 });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.content);
  assert.ok(bad.errors.rating);

  const good = validateTestimonialForm({
    author_name: 'Mariana Costa',
    content: 'Atendimento impecável, meu carro saiu brilhando como novo!',
    rating: 5,
  });
  assert.equal(good.valid, true);
});

test('sortByDisplayOrder orders items ascending by display_order', () => {
  const sorted = sortByDisplayOrder([
    { id: '3', display_order: 3, created_at: '2026-01-01T00:00:00Z' },
    { id: '1', display_order: 1, created_at: '2026-01-02T00:00:00Z' },
    { id: '2', display_order: 2, created_at: '2026-01-01T00:00:00Z' },
  ]);
  assert.deepEqual(
    sorted.map((s) => s.id),
    ['1', '2', '3']
  );
});

test('filterApprovedTestimonials returns only approved items', () => {
  const items: Testimonial[] = [
    { id: '1', author_name: 'Ana', content: 'Excelente trabalho!', rating: 5, status: 'aprovado', created_at: '' },
    { id: '2', author_name: 'Bruno', content: 'Muito bom!', rating: 4, status: 'pendente', created_at: '' },
  ];
  const approved = filterApprovedTestimonials(items);
  assert.equal(approved.length, 1);
  assert.equal(approved[0].id, '1');
});
