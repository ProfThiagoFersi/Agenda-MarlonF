import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthGate: React.FC = () => {
  const [modo, setModo] = useState<'login' | 'cadastro' | 'recuperar'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const traduzirErro = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('invalid login credentials')) {
      return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Confirme seu e-mail através do link enviado antes de acessar.';
    }
    if (lower.includes('user already registered')) {
      return 'Este e-mail já está cadastrado. Faça login para entrar.';
    }
    if (lower.includes('password should be at least')) {
      return 'A senha deve ter no mínimo 6 caracteres.';
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setErro(null);
    setSucesso(null);

    const emailLimpo = email.trim();
    if (!emailLimpo || !emailLimpo.includes('@')) {
      setErro('Informe um endereço de e-mail válido.');
      return;
    }

    if (modo !== 'recuperar' && password.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password,
        });
        if (error) throw error;
      } else if (modo === 'cadastro') {
        const { data, error } = await supabase.auth.signUp({
          email: emailLimpo,
          password,
        });
        if (error) throw error;
        if (!data.session) {
          setSucesso(
            'Conta criada! Verifique sua caixa de entrada para confirmar o e-mail e depois faça login.'
          );
          setModo('login');
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSucesso('Enviamos um link de redefinição de senha para o seu e-mail.');
        setModo('login');
      }
    } catch (err: any) {
      setErro(traduzirErro(err?.message || 'Não foi possível autenticar.'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Cabeçalho Clínico */}
        <div className="bg-stone-900 text-white px-6 py-6 flex items-center gap-3.5 border-b border-stone-800">
          <div className="w-12 h-12 rounded-xl bg-teal-950/60 border border-teal-500/40 shrink-0 overflow-hidden shadow-sm">
            <img
              src="/icon.svg"
              alt="Logo Psicólogo Marlon Figueiredo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white truncate">
              Marlon Figueiredo • Psicologia Clínica
            </h1>
            <p className="text-xs text-teal-300 truncate">
              Acesso Seguro ao Consultório & Prontuários
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-stone-900">
              {modo === 'login'
                ? 'Entrar no Sistema'
                : modo === 'cadastro'
                ? 'Criar Conta Profissional'
                : 'Recuperar Senha'}
            </h2>
            <p className="text-xs text-stone-500">
              {modo === 'login'
                ? 'Seus pacientes, agenda e prontuários são sincronizados na nuvem.'
                : modo === 'cadastro'
                ? 'Cadastre seu e-mail profissional para proteger e sincronizar sua clínica.'
                : 'Informe seu e-mail para receber o link de redefinição.'}
            </p>
          </div>

          {erro && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{sucesso}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              E-mail Profissional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marlon@consultorio.com.br"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
          </div>

          {modo !== 'recuperar' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-2.5 top-2.5 p-0.5 text-stone-400 hover:text-stone-700"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            {carregando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : modo === 'login' ? (
              <span>Acessar Agenda Clínica</span>
            ) : modo === 'cadastro' ? (
              <span>Criar Conta Segura</span>
            ) : (
              <span>Enviar Link de Recuperação</span>
            )}
          </button>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            {modo === 'login' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setErro(null);
                    setSucesso(null);
                    setModo('cadastro');
                  }}
                  className="text-teal-700 hover:underline font-semibold cursor-pointer"
                >
                  Criar primeira conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErro(null);
                    setSucesso(null);
                    setModo('recuperar');
                  }}
                  className="text-stone-500 hover:text-stone-800 hover:underline cursor-pointer"
                >
                  Esqueci a senha
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setErro(null);
                  setSucesso(null);
                  setModo('login');
                }}
                className="text-teal-700 hover:underline font-semibold cursor-pointer"
              >
                ← Voltar para o login
              </button>
            )}
          </div>
        </form>

        {/* Rodapé de Sigilo */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
          <span>Dados protegidos por autenticação e Row Level Security (Supabase).</span>
        </div>
      </div>
    </div>
  );
};
