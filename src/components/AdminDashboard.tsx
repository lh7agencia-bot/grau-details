import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Clock,
  HelpCircle,
  Image as ImageIcon,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  adminCreateFaq,
  adminCreateGalleryPhoto,
  adminCreateTestimonial,
  adminDeleteFaq,
  adminDeleteGalleryPhoto,
  adminDeleteMessage,
  adminDeleteTestimonial,
  adminUpdateFaq,
  adminUpdateGalleryPhoto,
  adminUpdateMessage,
  adminUpdateTestimonial,
  fetchAdminOverview,
  logoutAdmin,
  uploadGalleryImage,
} from '../lib/api';
import type {
  AdminOverviewData,
  AdminUser,
  FaqItem,
  GalleryPhoto,
  Testimonial,
  TestimonialStatus,
} from '../types';
import {
  BUSINESS_SHORT_NAME,
  formatDatePtBr,
  normalizeImagePath,
  sortFaqItems,
  sortGalleryPhotos,
} from '../utils/siteLogic';

type AdminTab = 'gallery' | 'testimonials' | 'messages' | 'faq';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onBackToSite: () => void;
  onDataChanged: () => void;
}

export function AdminDashboard({
  user,
  onLogout,
  onBackToSite,
  onDataChanged,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('gallery');
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Gallery Form
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoOrder, setNewPhotoOrder] = useState('1');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Testimonial Form & Filter
  const [testFilter, setTestFilter] = useState<'all' | TestimonialStatus>('all');
  const [newTestAuthor, setNewTestAuthor] = useState('');
  const [newTestContent, setNewTestContent] = useState('');
  const [newTestRating, setNewTestRating] = useState(5);
  const [newTestStatus, setNewTestStatus] = useState<TestimonialStatus>('aprovado');

  // FAQ Form & Editing
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqOrder, setNewFaqOrder] = useState('1');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqDraft, setEditingFaqDraft] = useState<{
    question: string;
    answer: string;
    display_order: number;
  } | null>(null);

  // Gallery Caption inline edit
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingPhotoDraft, setEditingPhotoDraft] = useState<{
    caption: string;
    display_order: number;
  } | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const overview = await fetchAdminOverview();
      setData(overview);
      setNewPhotoOrder(String(overview.gallery.length + 1));
      setNewFaqOrder(String(overview.faqs.length + 1));
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao carregar dados do painel.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const notify = (text: string, type: 'ok' | 'err' = 'ok') => {
    setFeedback({ type, text });
    window.setTimeout(() => {
      setFeedback((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    onLogout();
  };

  // --- Gallery Handlers ---
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
        reader.readAsDataURL(file);
      });
      const res = await uploadGalleryImage(file.name, dataUrl);
      setNewPhotoUrl(res.url);
      notify('Imagem enviada para /public/images/uploads com sucesso.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao enviar imagem.', 'err');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddPhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newPhotoCaption.trim()) {
      notify('Informe a imagem e a legenda da foto.', 'err');
      return;
    }
    try {
      await adminCreateGalleryPhoto({
        image_url: newPhotoUrl.trim(),
        caption: newPhotoCaption.trim(),
        display_order: Number(newPhotoOrder) || 1,
      });
      setNewPhotoUrl('');
      setNewPhotoCaption('');
      await loadOverview();
      onDataChanged();
      notify('Foto adicionada à galeria.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao salvar foto.', 'err');
    }
  };

  const handleMovePhoto = async (photo: GalleryPhoto, delta: number) => {
    const nextOrder = Math.max(1, photo.display_order + delta);
    try {
      await adminUpdateGalleryPhoto(photo.id, { display_order: nextOrder });
      await loadOverview();
      onDataChanged();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao reordenar foto.', 'err');
    }
  };

  const handleSavePhotoEdit = async (id: string) => {
    if (!editingPhotoDraft) return;
    try {
      await adminUpdateGalleryPhoto(id, editingPhotoDraft);
      setEditingPhotoId(null);
      setEditingPhotoDraft(null);
      await loadOverview();
      onDataChanged();
      notify('Foto atualizada.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atualizar foto.', 'err');
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await adminDeleteGalleryPhoto(id);
      await loadOverview();
      onDataChanged();
      notify('Foto removida da galeria.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao remover foto.', 'err');
    }
  };

  // --- Testimonial Handlers ---
  const handleAddTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTestAuthor.trim() || newTestContent.trim().length < 5) {
      notify('Preencha o nome do cliente e o depoimento.', 'err');
      return;
    }
    try {
      await adminCreateTestimonial({
        author_name: newTestAuthor.trim(),
        content: newTestContent.trim(),
        rating: newTestRating,
        status: newTestStatus,
      });
      setNewTestAuthor('');
      setNewTestContent('');
      setNewTestRating(5);
      await loadOverview();
      onDataChanged();
      notify('Depoimento salvo.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao salvar depoimento.', 'err');
    }
  };

  const handleToggleTestimonialStatus = async (item: Testimonial) => {
    const nextStatus: TestimonialStatus = item.status === 'aprovado' ? 'pendente' : 'aprovado';
    try {
      await adminUpdateTestimonial(item.id, { status: nextStatus });
      await loadOverview();
      onDataChanged();
      notify(
        nextStatus === 'aprovado'
          ? 'Depoimento aprovado e publicado no site.'
          : 'Depoimento movido para pendente.'
      );
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao alterar status.', 'err');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      await adminDeleteTestimonial(id);
      await loadOverview();
      onDataChanged();
      notify('Depoimento excluído.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir depoimento.', 'err');
    }
  };

  // --- Message Handlers ---
  const handleToggleMessageRead = async (id: string, isRead: boolean) => {
    try {
      await adminUpdateMessage(id, !isRead);
      await loadOverview();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atualizar mensagem.', 'err');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await adminDeleteMessage(id);
      await loadOverview();
      notify('Mensagem excluída.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir mensagem.', 'err');
    }
  };

  // --- FAQ Handlers ---
  const handleAddFaq = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      notify('Preencha a pergunta e a resposta.', 'err');
      return;
    }
    try {
      await adminCreateFaq({
        question: newFaqQuestion.trim(),
        answer: newFaqAnswer.trim(),
        display_order: Number(newFaqOrder) || 1,
      });
      setNewFaqQuestion('');
      setNewFaqAnswer('');
      await loadOverview();
      onDataChanged();
      notify('Pergunta adicionada ao FAQ.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao adicionar pergunta.', 'err');
    }
  };

  const handleSaveFaqEdit = async (id: string) => {
    if (!editingFaqDraft) return;
    try {
      await adminUpdateFaq(id, editingFaqDraft);
      setEditingFaqId(null);
      setEditingFaqDraft(null);
      await loadOverview();
      onDataChanged();
      notify('Pergunta atualizada.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao atualizar pergunta.', 'err');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await adminDeleteFaq(id);
      await loadOverview();
      onDataChanged();
      notify('Pergunta excluída do FAQ.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Erro ao excluir pergunta.', 'err');
    }
  };

  const orderedPhotos = sortGalleryPhotos(data?.gallery ?? []);
  const orderedFaqs = sortFaqItems(data?.faqs ?? []);
  const allTestimonials = data?.testimonials ?? [];
  const filteredTestimonials =
    testFilter === 'all'
      ? allTestimonials
      : allTestimonials.filter((t) => t.status === testFilter);
  const pendingTestimonialsCount = allTestimonials.filter((t) => t.status === 'pendente').length;
  const messages = data?.messages ?? [];
  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="min-h-screen bg-[#141416] text-[#F5F5F7]">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-[#1A1A1A]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#222226] px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-[#7B2CBF]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Ver Site</span>
            </button>
            <div>
              <h1 className="font-display text-lg font-bold text-white">
                {BUSINESS_SHORT_NAME} · Administração
              </h1>
              <p className="text-xs text-[#9A9AA6]">
                {user.email} · Banco:{' '}
                {data?.storageMode === 'supabase' ? 'Supabase' : 'Persistência Local'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-[#E4E4EA] transition-colors hover:border-rose-500/50 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {feedback && (
          <div
            role="status"
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              feedback.type === 'ok'
                ? 'border-[#7B2CBF]/50 bg-[#7B2CBF]/15 text-white'
                : 'border-rose-500/40 bg-rose-500/15 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Seções administrativas"
          className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-[#1B1B1F] p-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'gallery'}
            onClick={() => setActiveTab('gallery')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'gallery'
                ? 'bg-[#7B2CBF] text-white'
                : 'text-[#B4B4BE] hover:bg-white/5 hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            <span>Galeria</span>
            <span className="text-xs opacity-80 tabular-nums">({orderedPhotos.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'testimonials'}
            onClick={() => setActiveTab('testimonials')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'testimonials'
                ? 'bg-[#7B2CBF] text-white'
                : 'text-[#B4B4BE] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Star className="h-4 w-4" aria-hidden="true" />
            <span>Depoimentos</span>
            <span className="text-xs opacity-80 tabular-nums">
              ({allTestimonials.length}
              {pendingTestimonialsCount > 0 ? ` · ${pendingTestimonialsCount} pend.` : ''})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'messages'
                ? 'bg-[#7B2CBF] text-white'
                : 'text-[#B4B4BE] hover:bg-white/5 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            <span>Mensagens</span>
            <span className="text-xs opacity-80 tabular-nums">
              ({messages.length}
              {unreadMessagesCount > 0 ? ` · ${unreadMessagesCount} novas` : ''})
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'faq'}
            onClick={() => setActiveTab('faq')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'faq'
                ? 'bg-[#7B2CBF] text-white'
                : 'text-[#B4B4BE] hover:bg-white/5 hover:text-white'
            }`}
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            <span>FAQ</span>
            <span className="text-xs opacity-80 tabular-nums">({orderedFaqs.length})</span>
          </button>
        </div>

        {loading && !data ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl border border-white/10 bg-[#1E1E22]"
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {/* TAB 1: GALERIA */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <form
                  onSubmit={handleAddPhoto}
                  className="rounded-2xl border border-white/10 bg-[#1D1D21] p-6"
                >
                  <h2 className="font-display text-lg font-bold text-white">
                    Adicionar nova foto à galeria
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <label htmlFor="gal-url" className="block text-xs font-medium text-[#B4B4BE]">
                        Caminho da imagem ou Upload
                      </label>
                      <div className="mt-1.5 flex gap-2">
                        <input
                          id="gal-url"
                          type="text"
                          value={newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="/images/galeria-land-rover.jpeg"
                          className="w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none"
                        />
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-[#25252B] px-3 py-2 text-xs font-semibold text-white hover:border-[#7B2CBF] shrink-0">
                          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{uploadingImage ? '...' : 'Enviar'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-5">
                      <label htmlFor="gal-caption" className="block text-xs font-medium text-[#B4B4BE]">
                        Legenda
                      </label>
                      <input
                        id="gal-caption"
                        type="text"
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        placeholder="Ex.: Lavagem técnica e proteção de pintura"
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="gal-order" className="block text-xs font-medium text-[#B4B4BE]">
                        Ordem
                      </label>
                      <input
                        id="gal-order"
                        type="number"
                        min={1}
                        value={newPhotoOrder}
                        onChange={(e) => setNewPhotoOrder(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white tabular-nums focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#7B2CBF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8E3FD6]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Adicionar Foto</span>
                    </button>
                  </div>
                </form>

                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#1D1D21]">
                  {orderedPhotos.length === 0 ? (
                    <p className="p-8 text-center text-sm text-[#9A9AA6]">
                      Nenhuma foto cadastrada.
                    </p>
                  ) : (
                    orderedPhotos.map((photo) => {
                      const isEditing = editingPhotoId === photo.id;
                      return (
                        <div
                          key={photo.id}
                          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <img
                              src={normalizeImagePath(photo.image_url)}
                              alt={photo.caption}
                              referrerPolicy="no-referrer"
                              className="h-20 w-16 shrink-0 rounded-lg border border-white/10 object-cover bg-black"
                            />
                            {isEditing && editingPhotoDraft ? (
                              <div className="flex flex-1 flex-wrap gap-3">
                                <input
                                  type="text"
                                  aria-label="Editar legenda"
                                  value={editingPhotoDraft.caption}
                                  onChange={(e) =>
                                    setEditingPhotoDraft({
                                      ...editingPhotoDraft,
                                      caption: e.target.value,
                                    })
                                  }
                                  className="min-w-[220px] flex-1 rounded-lg border border-white/15 bg-[#141416] px-3 py-1.5 text-sm text-white"
                                />
                                <input
                                  type="number"
                                  aria-label="Editar ordem"
                                  min={1}
                                  value={editingPhotoDraft.display_order}
                                  onChange={(e) =>
                                    setEditingPhotoDraft({
                                      ...editingPhotoDraft,
                                      display_order: Number(e.target.value) || 1,
                                    })
                                  }
                                  className="w-20 rounded-lg border border-white/15 bg-[#141416] px-3 py-1.5 text-sm text-white tabular-nums"
                                />
                              </div>
                            ) : (
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                  {photo.caption}
                                </p>
                                <p className="mt-1 text-xs text-[#9A9AA6] tabular-nums">
                                  Ordem {photo.display_order} · {photo.image_url}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSavePhotoEdit(photo.id)}
                                  className="rounded-lg bg-[#7B2CBF] px-3 py-1.5 text-xs font-semibold text-white"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPhotoId(null)}
                                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#D6D6DF]"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleMovePhoto(photo, -1)}
                                  aria-label={`Subir ordem de "${photo.caption}"`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#25252B] text-white hover:border-[#7B2CBF]"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMovePhoto(photo, 1)}
                                  aria-label={`Descer ordem de "${photo.caption}"`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#25252B] text-white hover:border-[#7B2CBF]"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPhotoId(photo.id);
                                    setEditingPhotoDraft({
                                      caption: photo.caption,
                                      display_order: photo.display_order,
                                    });
                                  }}
                                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#7B2CBF]"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePhoto(photo.id)}
                                  aria-label={`Excluir foto "${photo.caption}"`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DEPOIMENTOS */}
            {activeTab === 'testimonials' && (
              <div className="space-y-8">
                <form
                  onSubmit={handleAddTestimonial}
                  className="rounded-2xl border border-white/10 bg-[#1D1D21] p-6"
                >
                  <h2 className="font-display text-lg font-bold text-white">
                    Cadastrar novo depoimento
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <label htmlFor="test-author" className="block text-xs font-medium text-[#B4B4BE]">
                        Nome do cliente
                      </label>
                      <input
                        id="test-author"
                        type="text"
                        value={newTestAuthor}
                        onChange={(e) => setNewTestAuthor(e.target.value)}
                        placeholder="Ex.: Marcos Silva · Corolla"
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="test-rating" className="block text-xs font-medium text-[#B4B4BE]">
                        Nota (1 a 5 estrelas)
                      </label>
                      <select
                        id="test-rating"
                        value={newTestRating}
                        onChange={(e) => setNewTestRating(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white focus:border-[#7B2CBF] focus:outline-none"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'Estrela' : 'Estrelas'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="test-status" className="block text-xs font-medium text-[#B4B4BE]">
                        Status inicial
                      </label>
                      <select
                        id="test-status"
                        value={newTestStatus}
                        onChange={(e) => setNewTestStatus(e.target.value as TestimonialStatus)}
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white focus:border-[#7B2CBF] focus:outline-none"
                      >
                        <option value="aprovado">Aprovado (visível no site)</option>
                        <option value="pendente">Pendente (oculto)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-12">
                      <label htmlFor="test-content" className="block text-xs font-medium text-[#B4B4BE]">
                        Texto do depoimento
                      </label>
                      <textarea
                        id="test-content"
                        rows={3}
                        value={newTestContent}
                        onChange={(e) => setNewTestContent(e.target.value)}
                        placeholder="Depoimento do cliente..."
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#7B2CBF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8E3FD6]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Salvar Depoimento</span>
                    </button>
                  </div>
                </form>

                {/* Filter bar */}
                <div className="flex items-center gap-2">
                  {(['all', 'aprovado', 'pendente'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setTestFilter(status)}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        testFilter === status
                          ? 'bg-[#7B2CBF] text-white'
                          : 'border border-white/10 bg-[#1D1D21] text-[#B4B4BE] hover:text-white'
                      }`}
                    >
                      {status === 'all' ? 'Todos' : status === 'aprovado' ? 'Aprovados' : 'Pendentes'}
                    </button>
                  ))}
                </div>

                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#1D1D21]">
                  {filteredTestimonials.length === 0 ? (
                    <p className="p-8 text-center text-sm text-[#9A9AA6]">
                      Nenhum depoimento neste filtro.
                    </p>
                  ) : (
                    filteredTestimonials.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5 text-xs">
                            <span className="font-semibold text-white text-sm">
                              {item.author_name}
                            </span>
                            <span aria-hidden="true" className="text-white/30">·</span>
                            <span className="text-[#C77DFF] font-medium tabular-nums">
                              {item.rating}/5 estrelas
                            </span>
                            <span aria-hidden="true" className="text-white/30">·</span>
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                item.status === 'aprovado' ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {item.status === 'aprovado' ? (
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                              {item.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-[#D6D6DF]">
                            “{item.content}”
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTestimonialStatus(item)}
                            className="rounded-lg border border-white/15 bg-[#25252B] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#7B2CBF]"
                          >
                            {item.status === 'aprovado' ? 'Mover para Pendente' : 'Aprovar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTestimonial(item.id)}
                            aria-label={`Excluir depoimento de ${item.author_name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: MENSAGENS */}
            {activeTab === 'messages' && (
              <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#1D1D21]">
                {messages.length === 0 ? (
                  <p className="p-10 text-center text-sm text-[#9A9AA6]">
                    Nenhuma mensagem recebida pelo formulário de contato ainda.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-sm font-semibold text-white">{msg.name}</span>
                          <span aria-hidden="true" className="text-white/30">·</span>
                          <span className="text-[#C77DFF]">{msg.email}</span>
                          <span aria-hidden="true" className="text-white/30">·</span>
                          <span className="text-[#9A9AA6] tabular-nums">
                            {formatDatePtBr(msg.created_at)}
                          </span>
                          <span aria-hidden="true" className="text-white/30">·</span>
                          <span
                            className={`font-semibold ${
                              msg.is_read ? 'text-[#9A9AA6]' : 'text-emerald-400'
                            }`}
                          >
                            {msg.is_read ? 'Lida' : 'Nova'}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#E4E4EA]">{msg.message}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent(
                            'Retorno Grau Details Estética Automotiva'
                          )}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#25252B] px-3 py-1.5 text-xs font-semibold text-white hover:border-[#7B2CBF]"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Responder</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleMessageRead(msg.id, msg.is_read)}
                          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#D6D6DF] hover:border-[#7B2CBF]"
                        >
                          {msg.is_read ? 'Marcar não lida' : 'Marcar lida'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          aria-label={`Excluir mensagem de ${msg.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-8">
                <form
                  onSubmit={handleAddFaq}
                  className="rounded-2xl border border-white/10 bg-[#1D1D21] p-6"
                >
                  <h2 className="font-display text-lg font-bold text-white">
                    Adicionar nova pergunta ao FAQ
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-10">
                      <label htmlFor="faq-q" className="block text-xs font-medium text-[#B4B4BE]">
                        Pergunta
                      </label>
                      <input
                        id="faq-q"
                        type="text"
                        value={newFaqQuestion}
                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                        placeholder="Ex.: Quanto tempo dura a proteção com cera de carnaúba?"
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="faq-order" className="block text-xs font-medium text-[#B4B4BE]">
                        Ordem
                      </label>
                      <input
                        id="faq-order"
                        type="number"
                        min={1}
                        value={newFaqOrder}
                        onChange={(e) => setNewFaqOrder(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white tabular-nums focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-12">
                      <label htmlFor="faq-a" className="block text-xs font-medium text-[#B4B4BE]">
                        Resposta
                      </label>
                      <textarea
                        id="faq-a"
                        rows={3}
                        value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        placeholder="Escreva a resposta clara para o cliente..."
                        className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#7B2CBF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8E3FD6]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Adicionar Pergunta</span>
                    </button>
                  </div>
                </form>

                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#1D1D21]">
                  {orderedFaqs.length === 0 ? (
                    <p className="p-8 text-center text-sm text-[#9A9AA6]">
                      Nenhuma pergunta cadastrada.
                    </p>
                  ) : (
                    orderedFaqs.map((faq: FaqItem) => {
                      const isEditing = editingFaqId === faq.id;
                      return (
                        <div key={faq.id} className="p-5">
                          {isEditing && editingFaqDraft ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-3">
                                <input
                                  type="text"
                                  aria-label="Editar pergunta"
                                  value={editingFaqDraft.question}
                                  onChange={(e) =>
                                    setEditingFaqDraft({
                                      ...editingFaqDraft,
                                      question: e.target.value,
                                    })
                                  }
                                  className="min-w-[240px] flex-1 rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white"
                                />
                                <input
                                  type="number"
                                  aria-label="Editar ordem da pergunta"
                                  min={1}
                                  value={editingFaqDraft.display_order}
                                  onChange={(e) =>
                                    setEditingFaqDraft({
                                      ...editingFaqDraft,
                                      display_order: Number(e.target.value) || 1,
                                    })
                                  }
                                  className="w-20 rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white tabular-nums"
                                />
                              </div>
                              <textarea
                                rows={3}
                                aria-label="Editar resposta"
                                value={editingFaqDraft.answer}
                                onChange={(e) =>
                                  setEditingFaqDraft({
                                    ...editingFaqDraft,
                                    answer: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-white/15 bg-[#141416] px-3 py-2 text-sm text-white"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingFaqId(null)}
                                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#D6D6DF]"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveFaqEdit(faq.id)}
                                  className="rounded-lg bg-[#7B2CBF] px-4 py-1.5 text-xs font-semibold text-white"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold text-[#C77DFF] tabular-nums">
                                  Ordem {faq.display_order}
                                </p>
                                <h3 className="mt-1 font-display text-base font-semibold text-white">
                                  {faq.question}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-[#B4B4BE]">
                                  {faq.answer}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFaqId(faq.id);
                                    setEditingFaqDraft({
                                      question: faq.question,
                                      answer: faq.answer,
                                      display_order: faq.display_order,
                                    });
                                  }}
                                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#7B2CBF]"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  aria-label={`Excluir pergunta "${faq.question}"`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
