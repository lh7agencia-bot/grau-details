import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FaqSection } from './components/FaqSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { checkAdminSession, fetchSiteData } from './lib/api';
import type { AdminUser, SiteDataSnapshot } from './types';

function isAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.pathname.startsWith('/admin') ||
    window.location.hash.startsWith('#admin')
  );
}

export default function App() {
  const [adminMode, setAdminMode] = useState<boolean>(() => isAdminRoute());
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(false);

  const [siteData, setSiteData] = useState<SiteDataSnapshot>({
    gallery: [],
    testimonials: [],
    faqs: [],
  });
  const [loadingSiteData, setLoadingSiteData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPublicSiteData = useCallback(async () => {
    try {
      setLoadError(null);
      const snapshot = await fetchSiteData();
      setSiteData(snapshot);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Erro ao carregar informações do site.'
      );
    } finally {
      setLoadingSiteData(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicSiteData();
  }, [loadPublicSiteData]);

  useEffect(() => {
    const syncRoute = () => {
      setAdminMode(isAdminRoute());
    };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  useEffect(() => {
    if (!adminMode) return;
    let cancelled = false;
    setCheckingAuth(true);
    void checkAdminSession().then((user) => {
      if (!cancelled) {
        setAdminUser(user);
        setCheckingAuth(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [adminMode]);

  const openAdmin = () => {
    window.location.hash = 'admin';
    setAdminMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToSite = () => {
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    } else {
      window.location.hash = '';
    }
    setAdminMode(false);
    void loadPublicSiteData();
  };

  if (adminMode) {
    if (checkingAuth) {
      return (
        <MotionConfig reducedMotion="user">
          <div className="flex min-h-screen items-center justify-center bg-[#141416]">
            <p className="text-sm font-medium text-[#B4B4BE]">Verificando sessão...</p>
          </div>
        </MotionConfig>
      );
    }
    if (!adminUser) {
      return (
        <MotionConfig reducedMotion="user">
          <AdminLogin onSuccess={(user) => setAdminUser(user)} onBackToSite={backToSite} />
        </MotionConfig>
      );
    }
    return (
      <MotionConfig reducedMotion="user">
        <AdminDashboard
          user={adminUser}
          onLogout={() => setAdminUser(null)}
          onBackToSite={backToSite}
          onDataChanged={() => void loadPublicSiteData()}
        />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#1A1A1A] text-[#F5F5F7]">
        <Navbar />
        <main>
          {loadError && (
            <div
              role="alert"
              className="mx-auto max-w-6xl px-4 pt-4 sm:px-6"
            >
              <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                <span>{loadError}</span>
                <button
                  type="button"
                  onClick={() => void loadPublicSiteData()}
                  className="rounded-md border border-rose-400/40 px-3 py-1 text-xs font-semibold hover:bg-rose-500/20"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
          <HeroSection />
          <ServicesSection />
          <GallerySection photos={siteData.gallery} loading={loadingSiteData} />
          <TestimonialsSection
            testimonials={siteData.testimonials}
            loading={loadingSiteData}
          />
          <FaqSection faqs={siteData.faqs} loading={loadingSiteData} />
          <ContactSection />
        </main>
        <Footer onOpenAdmin={openAdmin} />
        <WhatsAppFloat />
      </div>
    </MotionConfig>
  );
}
