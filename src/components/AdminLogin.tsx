import { useState, type FormEvent } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { loginAdmin } from '../lib/api';
import type { AdminUser } from '../types';
import { BUSINESS_SHORT_NAME } from '../utils/siteLogic';

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
  onBackToSite: () => void;
}

export function AdminLogin({ onSuccess, onBackToSite }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Informe o e-mail e a senha de administrador.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      onSuccess(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141416] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E1E22] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B4B4BE] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Voltar ao site</span>
          </button>

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#7B2CBF]/20 text-[#C77DFF]">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <h1 className="mt-6 font-display text-2xl font-bold text-white">
          Painel Administrativo
        </h1>
        <p className="mt-1.5 text-sm text-[#9A9AA6]">
          Acesse com suas credenciais para gerenciar galeria, depoimentos, mensagens e FAQ da{' '}
          {BUSINESS_SHORT_NAME}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-[#E4E4EA]">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@graudetails.com.br"
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3.5 py-2.5 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-[#E4E4EA]">
              Senha
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#141416] px-3.5 py-2.5 text-sm text-white placeholder-[#7A7A86] focus:border-[#7B2CBF] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#7B2CBF] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8E3FD6] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77DFF]"
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}
