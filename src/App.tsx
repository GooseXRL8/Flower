/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './utils/firebase';
import { User, Profile, LoveTheme } from './types';
import { Login } from './components/Login';
import { FlowerAnimation } from './components/FlowerAnimation';
import { TimeCounter } from './components/TimeCounter';
import { MemoriesTab } from './components/MemoriesTab';
import { ProfilePhotosGallery } from './components/ProfilePhotosGallery';
import { SettingsTab } from './components/SettingsTab';
import { AdminTab } from './components/AdminTab';
import { ShareableContent } from './components/ShareableContent';
import { getWeddingAnniversarySymbol } from './utils/timeFormatter';
import { LandingPage } from './components/LandingPage';
import { DEMO_USER, DEMO_PROFILE } from './data/demoData';
import { SafeImage } from './components/SafeImage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'tempo' | 'memorias' | 'polaroids' | 'settings' | 'admin'>('tempo');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isShowLogin, setIsShowLogin] = useState(false);

  // States for onboarding profile setup if user has null profile assigned
  const [obSetupName1, setObSetupName1] = useState('');
  const [obSetupName2, setObSetupName2] = useState('');
  const [obSetupStartDate, setObSetupStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [obSetupTheme, setObSetupTheme] = useState<LoveTheme>('pink');

  // Firebase auth state listener
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsDemoMode(false);
        // Fetch or listen to user document in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to User record changes in real-time
        const unsubUser = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            setCurrentUser(userData);

            // If the user has an assigned profile, listen to profile changes in real-time
            if (userData.assigned_profile_id) {
              if (unsubProfile) unsubProfile();
              
              unsubProfile = onSnapshot(doc(db, 'profiles', userData.assigned_profile_id), (profileSnap) => {
                if (profileSnap.exists()) {
                  setActiveProfile(profileSnap.data() as Profile);
                } else {
                  setActiveProfile(null);
                }
                setLoading(false);
              }, (err) => {
                console.error('Error fetching profile snapshot: ', err);
                setLoading(false);
              });
            } else {
              setActiveProfile(null);
              setLoading(false);
            }
          } else {
            // First time login - Bootstrap user document
            const isAdmin = firebaseUser.email === 'joaotitua@gmail.com';
            const newUser: User = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Casal',
              is_admin: isAdmin,
              assigned_profile_id: null,
              created_at: new Date().toISOString()
            };
            
            await setDoc(userRef, newUser);
            setCurrentUser(newUser);
            setActiveProfile(null);
            setLoading(false);
          }
        }, (err) => {
          console.error('Error fetching user snapshot: ', err);
          setLoading(false);
        });

        return () => {
          unsubUser();
          if (unsubProfile) unsubProfile();
        };
      } else {
        setCurrentUser(null);
        setActiveProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // User profile transitions are handled reactively by the onAuthStateChanged listener
  };

  const handleCreateOnboardingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newPid = 'prof_' + Math.random().toString(36).substring(2, 11);
    const newProfile: Profile = {
      id: newPid,
      name1: obSetupName1.trim() || currentUser.username,
      name2: obSetupName2.trim() || 'Parceiro(a)',
      created_by: currentUser.id,
      start_date: obSetupStartDate,
      custom_title: `${obSetupName1.trim()} & ${obSetupName2.trim()} - Amor Eterno 🌸`,
      theme: obSetupTheme,
      created_at: new Date().toISOString()
    };

    try {
      // 1. Create Profile document in Firestore
      await setDoc(doc(db, 'profiles', newPid), newProfile);

      // 2. Link profile ID in user document
      await setDoc(doc(db, 'users', currentUser.id), {
        assigned_profile_id: newPid
      }, { merge: true });

      // Local states will resolve automatically via active Firebase live-snapshots
      setActiveProfile(newProfile);
    } catch (err) {
      console.error('Failed to create onboarding couple profile:', err);
    }
  };

  const handleLogout = async () => {
    try {
      if (isDemoMode) {
        setIsDemoMode(false);
        setCurrentUser(null);
        setActiveProfile(null);
        setActiveTab('tempo');
        return;
      }
      await signOut(auth);
      setCurrentUser(null);
      setActiveProfile(null);
      setActiveTab('tempo');
      setIsShowLogin(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Safe styling configurations derived from theme
  const getThemeClass = () => {
    if (!activeProfile) return 'theme-pink';
    return `theme-${activeProfile.theme}`;
  };

  const getActiveTabStyles = () => {
    const t = activeProfile?.theme || 'pink';
    if (t === 'purple') {
      return 'bg-purple-500 text-white shadow-xs';
    } else if (t === 'green') {
      return 'bg-emerald-600 text-white shadow-xs';
    }
    return 'bg-rose-500 text-white shadow-xs';
  };

  const activeThemeColorHex = () => {
    const t = activeProfile?.theme || 'pink';
    if (t === 'purple') return 'text-purple-500 hover:text-purple-600';
    if (t === 'green') return 'text-emerald-600 hover:text-emerald-700';
    return 'text-rose-500 hover:text-rose-600';
  };

  const couplePhotoPlaceholder = () => {
    if (activeProfile?.image_url) {
      return activeProfile.image_url;
    }
    return 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50/20 flex flex-col items-center justify-center space-y-4">
        <span className="text-4xl animate-spin">🌸</span>
        <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Conectando ao Firebase...</p>
      </div>
    );
  }

  if (!currentUser && !isShowLogin) {
    return (
      <div id="root-romantic-container" className="min-h-screen theme-pink bg-gradient-to-br transition-all duration-500 relative overflow-hidden">
        <FlowerAnimation theme="pink" />
        <LandingPage 
          onEnterLogin={() => setIsShowLogin(true)} 
          onEnterDemo={() => {
            setIsDemoMode(true);
            setCurrentUser(DEMO_USER);
            setActiveProfile(DEMO_PROFILE);
          }} 
        />
      </div>
    );
  }

  return (
    <div id="root-romantic-container" className={`min-h-screen ${getThemeClass()} bg-gradient-to-br transition-all duration-500 pb-12 relative overflow-hidden`}>
      {/* Interactive top banner if in demo mode */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white text-xs py-2.5 px-4 shadow-sm text-center font-bold flex items-center justify-center gap-2 gap-y-1 flex-wrap relative z-40 animate-pulse-soft">
          <span>🌸 Você está navegando no Modo Exemplo Interativo do FlowerLove!</span>
          <button 
            onClick={() => {
              setIsDemoMode(false);
              setCurrentUser(null);
              setActiveProfile(null);
              setIsShowLogin(true);
            }} 
            className="bg-white text-rose-600 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider transition hover:bg-neutral-100 cursor-pointer shadow-xs"
          >
            Criar Perfil Original ✨
          </button>
        </div>
      )}

      {/* Dynamic particles falling based on active theme */}
      <FlowerAnimation theme={activeProfile?.theme || 'pink'} />

      {/* Main navigation header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin-slow">🌸</span>
            <div>
              <span className="font-serif font-bold text-lg text-gray-800 tracking-tight block">FlowerLove</span>
              {currentUser && (
                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                  Olá, {currentUser.username}! 👋
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && activeProfile && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                id="btn-open-share-modal"
                className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 border border-gray-150 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer`}
              >
                <span>💝</span>
                <span className="hidden sm:inline">Gerar Cartão</span>
              </button>
            )}

            {currentUser && (
              <button
                onClick={handleLogout}
                id="btn-logout"
                className="text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-155 bg-white px-2.5 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                title="Sair de Minha Conta"
              >
                <span>Sair</span>
                <span>🚪</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Primary content area */}
      <main className="max-w-5xl mx-auto px-4 pt-6 md:pt-10 relative z-15">
        
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center pt-8 animate-fade-in">
            <button 
              onClick={() => setIsShowLogin(false)} 
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition mb-6 focus:outline-none flex items-center gap-1.5 cursor-pointer bg-white px-5 py-2.5 rounded-full border border-rose-100 shadow-xs hover:shadow-sm"
            >
              <span>← Voltar para FlowerLove</span>
            </button>
            <Login onLoginSuccess={handleLogin} />
          </div>
        ) : !activeProfile ? (
          /* Profile onboarding form if user register successfully but has no profile */
          <div className="max-w-md mx-auto bg-white/95 rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl animate-fade-in space-y-5">
            <div className="text-center">
              <span className="text-4xl">👩‍❤️‍👨</span>
              <h2 className="text-xl font-serif font-bold text-gray-850 mt-3">Configure seu Perfil de Casal</h2>
              <p className="text-xs text-gray-400 mt-1">Insira as informações básicas para iniciar sua galeria e contador de tempo</p>
            </div>

            <form onSubmit={handleCreateOnboardingProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={obSetupName1}
                    onChange={(e) => setObSetupName1(e.target.value)}
                    placeholder="Ex: Pedro"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nome de seu Amor</label>
                  <input
                    type="text"
                    required
                    value={obSetupName2}
                    onChange={(e) => setObSetupName2(e.target.value)}
                    placeholder="Ex: Sofia"
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Data de Início da História</label>
                <input
                  type="date"
                  required
                  value={obSetupStartDate}
                  onChange={(e) => setObSetupStartDate(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Escolha seu primeiro Tom Visual</label>
                <div className="flex gap-2">
                  {[
                    { id: 'pink', name: 'Rosa ❤️', color: 'bg-rose-500' },
                    { id: 'purple', name: 'Roxo 🔮', color: 'bg-purple-500' },
                    { id: 'green', name: 'Verde 🍃', color: 'bg-emerald-505' }
                  ].map((themeOpt) => (
                    <button
                      key={themeOpt.id}
                      type="button"
                      onClick={() => setObSetupTheme(themeOpt.id as LoveTheme)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs transition ${
                        obSetupTheme === themeOpt.id
                          ? 'border-gray-900 bg-gray-50 font-semibold text-gray-900'
                          : 'border-gray-200 bg-white text-gray-505'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${themeOpt.color}`} />
                      <span>{themeOpt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                Criar Meu Mural de Amor ✨
              </button>
            </form>
          </div>
        ) : (
          /* Main application interface */
          <div className="space-y-8 animate-fade-in">
            
            {/* Quick Hero Banner visual card with couple profiles */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden relative group shrink-0 bg-rose-50 flex items-center justify-center">
                <SafeImage 
                  src={couplePhotoPlaceholder()} 
                  alt="Couple Profile Avatar" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  theme={activeProfile.theme || 'pink'}
                  fallbackType="avatar"
                />
              </div>

              <div className="text-center md:text-left space-y-1">
                <h2 className="text-2xl font-serif font-black text-gray-800 tracking-tight">
                  {activeProfile.name1} & {activeProfile.name2}
                </h2>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
                  Nosso espaço romântico seguro e privativo
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center md:justify-start">
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    💝 Casal Ativo
                  </span>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    ☁️ Sincronizado Firebase
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center">
              <div className="flex bg-white/95 backdrop-blur-xs p-1 rounded-2xl border border-gray-150 shadow-sm max-w-full overflow-x-auto whitespace-nowrap scrollbar-none gap-1">
                {[
                  { id: 'tempo', label: '🕒 Tempo Juntos' },
                  { id: 'memorias', label: '📖 Baú de Lembranças' },
                  { id: 'polaroids', label: '📸 Mural Polaroids' },
                  { id: 'settings', label: '⚙️ Ajustes' },
                  ...(currentUser.is_admin ? [{ id: 'admin', label: '🔑 Admin' }] : [])
                ].map((tabItem) => {
                  const isActive = activeTab === tabItem.id;
                  return (
                    <button
                      key={tabItem.id}
                      onClick={() => setActiveTab(tabItem.id as any)}
                      id={`tab-btn-${tabItem.id}`}
                      className={`text-xs font-semibold py-2 px-3.5 rounded-xl transition cursor-pointer select-none ${
                        isActive ? getActiveTabStyles() : 'text-gray-500 hover:text-gray-755'
                      }`}
                    >
                      {tabItem.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Tabs contents block of grid cards */}
            <div className="bg-white/95 backdrop-blur-xs border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[40vh] transition duration-300">
              {activeTab === 'tempo' && (
                <div className="space-y-6">
                  <TimeCounter profile={activeProfile} />

                  {/* Wedding anniversary informational bento block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* List of Bodas/Anniversaries */}
                    <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lista de Nossas Bodas</span>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {[1, 2, 3, 4, 5, 8, 10, 15, 25, 50].map((years) => {
                          const itemSymbol = getWeddingAnniversarySymbol(years);
                          return (
                            <div key={years} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                                <span>{itemSymbol.symbol}</span>
                                <span>{years} {years === 1 ? 'Ano' : 'Anos'}: {itemSymbol.name}</span>
                              </span>
                              <span className="text-gray-400 font-mono">Bodas</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Romantic quotes of the day */}
                    <div className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Frase Romântica do Dia</span>
                        <blockquote className="text-sm font-serif italic text-gray-700 leading-relaxed font-semibold">
                          "O amor não consiste em olhar um para o outro, mas sim em olhar juntos na mesma direção."
                        </blockquote>
                        <span className="text-[10px] text-gray-400 block mt-2 font-mono">— Antoine de Saint-Exupéry</span>
                      </div>
                      
                      <div className="border-t border-gray-50 pt-4 mt-4 flex items-center gap-2">
                        <span className="text-rose-500 animate-pulse text-lg">💡</span>
                        <p className="text-[11px] text-gray-500">
                          Compartilhe esses momentos valiosos nas redes ou envie por WhatsApp! Clique em <strong className={activeThemeColorHex()}>Gerar Cartão</strong> no topo.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'memorias' && (
                <MemoriesTab profile={activeProfile} isDemo={isDemoMode} />
              )}

              {activeTab === 'polaroids' && (
                <ProfilePhotosGallery user={currentUser} profile={activeProfile} isDemo={isDemoMode} />
              )}

              {activeTab === 'settings' && (
                <SettingsTab profile={activeProfile} onProfileUpdated={(prof) => setActiveProfile(prof)} />
              )}

              {activeTab === 'admin' && (
                <AdminTab currentUser={currentUser} />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Share Modal Backdrop */}
      {isShareModalOpen && currentUser && activeProfile && (
        <ShareableContent profile={activeProfile} onClose={() => setIsShareModalOpen(false)} />
      )}

      {/* Humble Footer */}
      <footer className="text-center text-xs text-gray-400 font-medium py-10 relative z-10 space-y-1">
        <p>Desenvolvido com carinho por casais para casais • FlowerLove © 2026</p>
        <p className="text-[10px] text-gray-300 font-mono uppercase tracking-wider">Feito sob medida para {activeProfile ? `${activeProfile.name1} & ${activeProfile.name2}` : 'sua história'}</p>
      </footer>
    </div>
  );
}
