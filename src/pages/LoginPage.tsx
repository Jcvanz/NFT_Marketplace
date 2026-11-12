import React, { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Eye, EyeOff, X } from 'lucide-react';

interface LoginPageProps {
  initialTab?: 'login' | 'register';
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialTab = 'login', onClose }) => {
  const searchParams = useSearch({ strict: false });
  const redirectUrl = (searchParams as any)?.redirect;
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Estados de Login
  const [loginEmail, setLoginEmail] = useState('alice@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados de Cadastro
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Por favor informe e-mail e senha.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: loginEmail, password: loginPassword });
      if (onClose) {
        onClose();
      } else {
        navigate({ to: redirectUrl || '/' });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Falha ao autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        name: regUsername,
        handle: regUsername.startsWith('@') ? regUsername : `@${regUsername}`,
        email: regEmail,
        password: regPassword,
      });
      if (onClose) {
        onClose();
      } else {
        navigate({ to: redirectUrl || '/' });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Falha ao realizar cadastro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: 'Google' | 'Facebook') => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Simula login social com usuário demonstrativo
      await login({ email: 'alice@example.com', password: 'password123' });
      if (onClose) {
        onClose();
      } else {
        navigate({ to: redirectUrl || '/' });
      }
    } catch (err: any) {
      setError(`Falha ao conectar com ${provider}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBody = (
    <div className="w-full max-w-[450px] bg-[#241612] border border-[#3F2319] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-lg text-[#CFB28C] hover:text-[#D28A4C] hover:bg-[#180E0C] transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-center gap-3 text-lg sm:text-xl font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`transition-colors cursor-pointer ${
              tab === 'login'
                ? 'text-[#E89B55]'
                : 'text-[#F5F1EB] hover:text-[#E89B55]/80'
            }`}
          >
            Entrar
          </button>
          <span className="text-[#E89B55] select-none text-xl font-light">|</span>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`transition-colors cursor-pointer ${
              tab === 'register'
                ? 'text-[#E89B55]'
                : 'text-[#F5F1EB] hover:text-[#E89B55]/80'
            }`}
          >
            Criar conta
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

          {/* TAB LOGIN */}
          {tab === 'login' ? (
            <div className="space-y-4">
              <p className="text-center text-xs sm:text-sm text-[#F5F1EB] leading-relaxed">
                Entre para gerenciar sua carteira, coleção e perfil de criador.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 text-xs sm:text-sm px-4 py-3 pr-11 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D28A4C]/70 hover:text-[#D28A4C] cursor-pointer"
                    aria-label={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Botão de esquecer senha */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      alert('Recuperação de senha: enviamos um link de redefinição para o seu e-mail cadastrado.')
                    }
                    className="text-xs text-[#CFB28C] hover:text-[#E89B55] transition-colors cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                {/* Botão "Entrar" cor #D28A4C */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm uppercase tracking-wider hover:bg-[#c0793b] active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <span>Entrar</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* TAB CADASTRO */
            <div className="space-y-4">
              <p className="text-center text-xs sm:text-sm text-[#F5F1EB] leading-relaxed">
                Crie seu perfil de colecionador e conecte uma carteira quando quiser.
              </p>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Nome de usuário"
                    required
                    className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Senha"
                    required
                    className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 text-xs sm:text-sm px-4 py-3 pr-11 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D28A4C]/70 hover:text-[#D28A4C] cursor-pointer"
                    aria-label={showRegPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirmar senha"
                    required
                    className="w-full bg-[#180E0C] text-[#D28A4C] placeholder-[#D28A4C]/50 text-xs sm:text-sm px-4 py-3 pr-11 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D28A4C]/70 hover:text-[#D28A4C] cursor-pointer"
                    aria-label={showRegConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Botão "Criar conta" cor #D28A4C */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 mt-1 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-sm uppercase tracking-wider hover:bg-[#c0793b] active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    <span>Criar conta</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* DIVISÓRIA: Borda direita e esquerda #3F2319 e "Ou continue com" */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="flex-grow border-t border-[#3F2319]" />
            <span className="shrink-0 px-3 text-xs text-[#CFB28C] font-medium">
              Ou continue com
            </span>
            <div className="flex-grow border-t border-[#3F2319]" />
          </div>

          {/* BOTÕES DE LOGIN SOCIAL (GOOGLE E FACEBOOK) */}
          <div className="space-y-2.5">
            {/* Continuar com o Google */}
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              className="w-full py-2.5 px-4 rounded-lg border border-[#3F2319] bg-[#180E0C] hover:bg-[#20120d] hover:border-[#D28A4C]/60 transition-all text-xs sm:text-sm font-semibold text-[#F5F1EB] flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            {/* Continuar com o Facebook */}
            <button
              type="button"
              onClick={() => handleSocialAuth('Facebook')}
              className="w-full py-2.5 px-4 rounded-lg border border-[#3F2319] bg-[#180E0C] hover:bg-[#20120d] hover:border-[#D28A4C]/60 transition-all text-xs sm:text-sm font-semibold text-[#F5F1EB] flex items-center justify-center gap-3 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continuar com o Facebook</span>
            </button>
          </div>
        </div>

        <div className="h-[5px] w-full bg-[#D28A4C]" />
      </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-[450px]">
          {modalBody}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      {modalBody}
    </div>
  );
};

export default LoginPage;
