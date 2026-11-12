import React, { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useWallet } from '../context/WalletContext';
import {
  User,
  MapPin,
  ShoppingCart,
  Heart,
  TrendingUp,
  Download,
  AlertTriangle,
  LogOut,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Wrench,
} from 'lucide-react';
import { image1 } from '../assets';
import { BottomNavBar } from '../components/BottomNavBar';

type NavTabId =
  | 'profile'
  | 'wallets'
  | 'activity'
  | 'wishlist'
  | 'offers'
  | 'downloads'
  | 'support';

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ElementType;
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });
  const queryTab = (searchParams as any)?.tab;

  const { user: authUser, logout } = useAuth();
  const {
    user: profileUser,
    updateProfile,
    isUpdatingProfile,
    changePassword,
    isChangingPassword,
  } = useProfile();
  const { selectedWallet } = useWallet();

  const currentUser = profileUser || authUser;

  // Aba ativa inicializada com base no query param ?tab=...
  const [activeTab, setActiveTab] = useState<NavTabId>(() => {
    if (queryTab === 'wallets') return 'wallets';
    return 'profile';
  });

  useEffect(() => {
    if (queryTab && ['profile', 'wallets', 'activity', 'wishlist', 'offers', 'downloads', 'support'].includes(queryTab)) {
      setActiveTab(queryTab as NavTabId);
    }
  }, [queryTab]);

  // ==========================================================
  // Estados da aba "Dados do perfil"
  // ==========================================================
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [ensName, setEnsName] = useState('colecionador.eth');
  const [walletNickname, setWalletNickname] = useState('Carteira Principal');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Estados de alteração de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedbacks de perfil
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ==========================================================
  // Estados da aba "Carteiras"
  // ==========================================================
  const [walletDisplayName, setWalletDisplayName] = useState('');
  const [walletNicknameField, setWalletNicknameField] = useState('Carteira Principal');
  const [walletNetwork, setWalletNetwork] = useState('ethereum');
  const [walletProfileName, setWalletProfileName] = useState('Coleção Principal');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletSecondaryAddress, setWalletSecondaryAddress] = useState('');
  const [walletType, setWalletType] = useState('metamask');
  const [walletReferralCode, setWalletReferralCode] = useState('');
  const [walletEmail, setWalletEmail] = useState('');
  const [ensPrefix, setEnsPrefix] = useState('colecionador');
  const [ensSuffix, setEnsSuffix] = useState('.eth');
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const [walletFeedback, setWalletFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.handle || '');
      setEmail(currentUser.email || '');
      const initialAvatar =
        currentUser.avatarUrl && !currentUser.avatarUrl.includes('unsplash')
          ? currentUser.avatarUrl
          : image1;
      setAvatarUrl(initialAvatar);

      setWalletDisplayName(currentUser.name || '');
      setWalletEmail(currentUser.email || '');
      setWalletAddress(
        selectedWallet?.address || currentUser.wallets?.[0]?.address || '0x71C...49A'
      );
    }
  }, [currentUser, selectedWallet]);

  const navItems: NavItem[] = [
    { id: 'profile', label: 'Dados do perfil', icon: User },
    { id: 'wallets', label: 'Carteiras', icon: MapPin },
    { id: 'activity', label: 'Atividade', icon: ShoppingCart },
    { id: 'wishlist', label: 'Lista de interesse', icon: Heart },
    { id: 'offers', label: 'Ofertas', icon: TrendingUp },
    { id: 'downloads', label: 'Arquivos baixados', icon: Download },
    { id: 'support', label: 'Suporte', icon: AlertTriangle },
  ];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    setProfileError(null);

    try {
      await updateProfile({
        name,
        handle: username.startsWith('@') ? username : `@${username}`,
        avatarUrl,
      });
      setProfileFeedback('Dados do perfil salvos com sucesso!');
      setTimeout(() => setProfileFeedback(null), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao atualizar dados do perfil.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos de senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setPasswordFeedback('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 3000);
    } catch (err: any) {
      setPasswordError(
        err.response?.data?.error?.message || err.message || 'Erro ao alterar senha.'
      );
    }
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletFeedback('Carteira principal salva com sucesso!');
    setTimeout(() => setWalletFeedback(null), 3500);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 space-y-8 max-w-6xl pb-28 md:pb-32">
      {/* Grid com 2 colunas: Navegação à esquerda e Conteúdo à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LADO ESQUERDO: MENU DE NAVEGAÇÃO */}
        {/* ======================================================== */}
        <aside className="lg:col-span-4 bg-[#241612] border border-[#3F2319] rounded-2xl p-5 shadow-xl space-y-4">
          {/* Título: Meu perfil */}
          <h2 className="text-xl font-bold text-[#F5F1EB] text-left pb-3 border-b border-[#3F2319]">
            Meu perfil
          </h2>

          {/* Lista de Itens de navegação */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isSelected = activeTab === item.id;
              const IconComponent = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer rounded-r-lg ${
                    isSelected
                      ? 'border-l-[3px] border-[#E89B55] bg-[#E89B55]/10 text-[#E89B55] font-bold'
                      : 'text-[#CFB28C] hover:text-[#F5F1EB] hover:bg-[#180E0C]/60 border-l-[3px] border-transparent'
                  }`}
                >
                  <IconComponent
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? 'text-[#E89B55]' : 'text-[#CFB28C]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Item: Sair com borda em cima #D28A4C */}
            <div className="pt-3 mt-2 border-t border-[#D28A4C]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-3.5 py-3 text-left text-xs sm:text-sm font-semibold text-[#CFB28C] hover:text-destructive hover:bg-destructive/10 rounded-r-lg transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0 text-[#CFB28C]" />
                <span>Sair</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* ======================================================== */}
        {/* LADO DIREITO: CONTEÚDO DA ABA SELECIONADA */}
        {/* ======================================================== */}
        <main className="lg:col-span-8 px-6 sm:px-8 space-y-8">
          {activeTab === 'profile' ? (
            /* ======================================================== */
            /* ABA: DADOS DO PERFIL */
            /* ======================================================== */
            <div className="space-y-8">
              {/* Título alinhado na esquerda: Perfil do colecionador */}
              <div className="space-y-2">
                <h1 className="text-base sm:text-xl font-bold text-[#F5F1EB] text-left">
                  Perfil do colecionador
                </h1>
              </div>

              {/* Feedbacks de sucesso / erro no perfil */}
              {profileFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{profileFeedback}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Formulário com os dados */}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#CFB28C] block">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4 sm:gap-6 pt-1">
                    {/* Círculo com a imagem ou ícone padrão */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#180E0C] border-2 border-[#D28A4C] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                      {avatarUrl ? (
                        <img
                          src={!avatarUrl.includes('unsplash') ? avatarUrl : image1}
                          alt={name || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={image1}
                          alt={name || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Dois botões do lado: Alterar e Remover */}
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2.5 rounded-lg bg-[#D28A4C] text-[#140D0A] font-extrabold text-xs uppercase tracking-wider hover:bg-[#c0793b] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center">
                        Alterar
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="px-3.5 py-2.5 rounded-lg bg-transparent text-[#F5F1EB] hover:text-destructive font-semibold text-xs tracking-wider transition-colors cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Nome de exibição */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Nome de exibição
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome completo..."
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Nome de usuário */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Nome de usuário
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@usuario..."
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Nome ENS (select) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Nome ENS
                    </label>
                    <select
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                      className="w-full bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    >
                      <option value="colecionador.eth">colecionador.eth</option>
                      <option value="kurio.eth">kurio.eth</option>
                      <option value="ape.eth">ape.eth</option>
                      <option value="">Nenhum domínio ENS vinculado</option>
                    </select>
                  </div>

                  {/* Apelido da carteira */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Apelido da carteira
                    </label>
                    <input
                      type="text"
                      value={walletNickname}
                      onChange={(e) => setWalletNickname(e.target.value)}
                      placeholder="Ex: Carteira Principal (Cold Storage)"
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>
                </div>

                {/* Botão Salvar dados do perfil */}
                <div className="flex pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 rounded-xl bg-[#D28A4C] text-[#140D0A] font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#c0793b] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Salvando perfil...</span>
                      </div>
                    ) : (
                      <span>Salvar perfil</span>
                    )}
                  </button>
                </div>
              </form>

              {/* ======================================================== */}
              {/* BLOCO EM BAIXO PARA ALTERAR A SENHA */}
              {/* ======================================================== */}
              <div className="pt-6 border-t border-[#3F2319] space-y-5">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-[#F5F1EB]">
                    Alterar senha
                  </h2>
                </div>

                {/* Feedbacks de senha */}
                {passwordFeedback && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{passwordFeedback}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Senha atual */}
                    <div className="max-w-80">
                      <label className="text-xs font-semibold text-[#CFB28C] block pb-2">
                        Senha atual
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 pr-10 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFB28C] hover:text-[#D28A4C] cursor-pointer"
                          aria-label={showCurrentPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Nova senha */}
                    <div className="max-w-80">
                      <label className="text-xs font-semibold text-[#CFB28C] block pb-2">
                        Nova senha
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 pr-10 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFB28C] hover:text-[#D28A4C] cursor-pointer"
                          aria-label={showNewPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar nova senha */}
                    <div className="max-w-80">
                      <label className="text-xs font-semibold text-[#CFB28C] block pb-2">
                        Confirmar nova senha
                      </label>
                      <div className="relative max-w-108">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 pr-10 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFB28C] hover:text-[#D28A4C] cursor-pointer"
                          aria-label={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Botão de salvar - cor #D28A4C, texto #140D0A */}
                  <div className="flex pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-3 rounded-xl bg-[#D28A4C] text-[#140D0A] font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#c0793b] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Atualizando...</span>
                        </div>
                      ) : (
                        <span>Salvar</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeTab === 'wallets' ? (
            /* ======================================================== */
            /* ABA: CARTEIRAS */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Topo: Carteira principal + botão "adicionar" na direita na cor #E89B55 */}
              <div className="space-y-2 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-xl font-bold text-[#F5F1EB]">
                    Carteira principal
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setWalletFeedback(
                        'Preencha os campos abaixo para configurar uma nova carteira.'
                      );
                      setTimeout(() => setWalletFeedback(null), 3000);
                    }}
                    className="text-xs sm:text-sm font-bold text-[#E89B55] hover:underline cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[#CFB28C]">
                  Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
                </p>
              </div>

              {/* Feedback de sucesso */}
              {walletFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{walletFeedback}</span>
                </div>
              )}

              {/* Form de Carteira Principal */}
              <form onSubmit={handleSaveWallet} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Nome de exibição */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Nome de exibição
                    </label>
                    <input
                      type="text"
                      value={walletDisplayName}
                      onChange={(e) => setWalletDisplayName(e.target.value)}
                      placeholder="Nome de exibição..."
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Apelido da carteira */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Apelido da carteira
                    </label>
                    <input
                      type="text"
                      value={walletNicknameField}
                      onChange={(e) => setWalletNicknameField(e.target.value)}
                      placeholder="Ex: Minha Carteira Principal"
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Rede (select) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Rede
                    </label>
                    <select
                      value={walletNetwork}
                      onChange={(e) => setWalletNetwork(e.target.value)}
                      className="w-full bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    >
                      <option value="ethereum">Ethereum Mainnet</option>
                      <option value="polygon">Polygon</option>
                      <option value="arbitrum">Arbitrum One</option>
                      <option value="optimism">Optimism</option>
                    </select>
                  </div>

                  {/* Nome do perfil */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Nome do perfil
                    </label>
                    <input
                      type="text"
                      value={walletProfileName}
                      onChange={(e) => setWalletProfileName(e.target.value)}
                      placeholder="Nome do perfil..."
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Endereço da carteira */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Endereço da carteira
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Outro input com placeholder "ENS ou carteira secundária (opcional)" */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Carteira secundária / ENS
                    </label>
                    <input
                      type="text"
                      value={walletSecondaryAddress}
                      onChange={(e) => setWalletSecondaryAddress(e.target.value)}
                      placeholder="ENS ou carteira secundária (opcional)"
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Tipo de carteira (select) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Tipo de carteira
                    </label>
                    <select
                      value={walletType}
                      onChange={(e) => setWalletType(e.target.value)}
                      className="w-full bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    >
                      <option value="metamask">MetaMask</option>
                      <option value="coinbase">Coinbase Wallet</option>
                      <option value="walletconnect">WalletConnect</option>
                      <option value="phantom">Phantom</option>
                    </select>
                  </div>

                  {/* Código de indicação */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Código de indicação
                    </label>
                    <input
                      type="text"
                      value={walletReferralCode}
                      onChange={(e) => setWalletReferralCode(e.target.value)}
                      placeholder="Código de indicação..."
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={walletEmail}
                      onChange={(e) => setWalletEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                    />
                  </div>

                  {/* Nome ENS (select com .eth, etc, e ao lado um input para preencher) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CFB28C] block">
                      Nome ENS
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={ensSuffix}
                        onChange={(e) => setEnsSuffix(e.target.value)}
                        className="w-17 shrink-0 bg-[#180E0C] text-[#F5F1EB] text-xs sm:text-sm px-3 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                      >
                        <option value=".eth">.eth</option>
                        <option value=".sol">.sol</option>
                        <option value=".crypto">.crypto</option>
                        <option value=".xyz">.xyz</option>
                      </select>
                      <input
                        type="text"
                        value={ensPrefix}
                        onChange={(e) => setEnsPrefix(e.target.value)}
                        placeholder="nome-ens"
                        className="flex-1 bg-[#180E0C] text-[#F5F1EB] placeholder-[#CFB28C]/40 text-xs sm:text-sm px-4 py-3 rounded-lg border border-[#3F2319] focus:outline-none focus:border-[#D28A4C] focus:ring-1 focus:ring-[#D28A4C] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Botão "Salvar carteira" */}
                <div className="flex pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#D28A4C] text-[#140D0A] font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#c0793b] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center"
                  >
                    Salvar carteira
                  </button>
                </div>
              </form>

              {/* ======================================================== */}
              {/* COMPONENTE ABAIXO: CARTEIRA SECUNDÁRIA */}
              {/* ======================================================== */}
              <div className="pt-6 border-t border-[#3F2319]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Primeiro bloco: Titulo Carteira secundária + texto Você ainda não adicionou uma carteira secundária. */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#F5F1EB]">
                      Carteira secundária
                    </h3>
                    <p className="text-xs sm:text-sm text-[#CFB28C]">
                      Você ainda não adicionou uma carteira secundária.
                    </p>
                  </div>

                  {/* Segundo bloco: checkbox Igual à carteira principal + Adicionar na cor #E89B55 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-[#F5F1EB] cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={sameAsPrimary}
                        onChange={(e) => setSameAsPrimary(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border border-[#D28A4C] transition-all flex items-center justify-center shrink-0 ${
                          sameAsPrimary ? 'bg-[#D28A4C]' : 'bg-transparent'
                        }`}
                      />
                      <span>Igual à carteira principal</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setWalletFeedback(
                          'Carteira secundária espelhada com sucesso.'
                        );
                        setTimeout(() => setWalletFeedback(null), 3000);
                      }}
                      className="text-xs sm:text-sm font-bold text-[#E89B55] hover:underline cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* DEMAIS ABAS: EM DESENVOLVIMENTO */
            /* ======================================================== */
            <div className="py-16 px-4 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#180E0C] border border-[#3F2319] flex items-center justify-center mx-auto text-[#D28A4C] shadow-lg">
                <Wrench className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-[#F5F1EB]">
                {navItems.find((item) => item.id === activeTab)?.label}
              </h3>
              <p className="text-xs sm:text-sm text-[#CFB28C] leading-relaxed">
                Esta funcionalidade está sendo desenvolvida com exclusividade para os colecionadores da Kurio e estará disponível em breve.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-5 py-2.5 rounded-xl bg-[#D28A4C] text-[#140D0A] font-bold text-xs uppercase tracking-wider hover:bg-[#c0793b] transition-all cursor-pointer shadow-md"
                >
                  Voltar para Dados do Perfil
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default ProfilePage;
