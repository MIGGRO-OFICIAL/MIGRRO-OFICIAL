
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import CommunityView from './views/CommunityView';
import MarketplaceView from './views/MarketplaceView';
import AiGuideView from './views/AiGuideView';
import CoinBalance from './components/CoinBalance';
import AdminPanel from './views/AdminPanel';
import ChatView from './views/ChatView';
import ProfileView from './views/ProfileView';
import PublicProfileView from './views/PublicProfileView';
import VerificationFlow from './views/VerificationFlow';
import CreatePostModal from './components/CreatePostModal';
import CreateGroupModal from './components/CreateGroupModal';
import CreateServiceRequestModal from './components/CreateServiceRequestModal';
import MyRequestsView from './views/MyRequestsView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ServiceDetailView from './views/ServiceDetailView';
import OpenRequestsView from './views/OpenRequestsView';
import PostDetailView from './views/PostDetailView';
import ProviderDashboard from './views/ProviderDashboard';
import SearchModal from './components/SearchModal';
import { ViewState, User } from './types';
import { CURRENT_USER, TRUSTED_PROVIDER } from './services/mockData';
import { MessageCircle, Search } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import NotificationsBell from './components/NotificationsBell';

const App: React.FC = () => {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Se não estiver autenticado e não estiver na tela de login/signup, mostrar login
  useEffect(() => {
    if (!authLoading && !authUser && currentView !== ViewState.LOGIN && currentView !== ViewState.SIGNUP) {
      setCurrentView(ViewState.LOGIN);
    }
  }, [authUser, authLoading, currentView]);

  // Redirecionar para HOME após login bem-sucedido
  useEffect(() => {
    if (!authLoading && authUser && currentView === ViewState.LOGIN) {
      console.log('[App] Usuário autenticado, redirecionando para HOME');
      setCurrentView(ViewState.HOME);
    }
  }, [authUser, authLoading, currentView]);
  
  // Converter authUser para formato User
  const user: User = authUser ? {
    id: authUser.id,
    name: authUser.name,
    avatar: authUser.avatar_url || '',
    location: authUser.location || '',
    role: authUser.role as 'imigrant' | 'helper' | 'admin',
    raizCoins: authUser.raiz_coins || 0,
    badges: [],
    trustScore: authUser.trust_score || 0,
    verificationSteps: [],
    reviews: [],
    joinDate: new Date().toLocaleDateString('pt-BR'),
  } : CURRENT_USER;
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isServiceRequestModalOpen, setIsServiceRequestModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // State for inspecting other profiles
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);

  // Layout adjustment: If Admin, use full width. If App, use mobile container.
  const isMobileView = currentView !== ViewState.ADMIN;
  const containerClass = isMobileView 
    ? "min-h-screen bg-[#f8fafc] text-gray-800 font-sans" 
    : "h-screen bg-gray-50 text-gray-800 font-sans";

  // Simulate opening a public profile (e.g., from Marketplace)
  const handleOpenPublicProfile = (targetUser: User = TRUSTED_PROVIDER) => {
      setInspectedUser(targetUser);
      setCurrentView(ViewState.PUBLIC_PROFILE);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <HomeView user={user} />;
      case ViewState.FEED:
        return (
          <CommunityView 
            mode="feed"
            onCreatePost={() => setIsPostModalOpen(true)}
            onSelectUser={(userId) => {
              setSelectedUserId(userId);
              setCurrentView(ViewState.PUBLIC_PROFILE);
            }}
          />
        );
      case ViewState.GROUPS:
        return (
          <CommunityView 
            mode="groups"
            onOpenGroup={(id) => {
              setSelectedGroupId(id);
              setCurrentView(ViewState.GROUP_DETAIL);
            }}
            onCreatePost={() => setIsPostModalOpen(true)}
            onSelectUser={(userId) => {
              setSelectedUserId(userId);
              setCurrentView(ViewState.PUBLIC_PROFILE);
            }}
          />
        );
      case ViewState.GROUP_DETAIL:
        return selectedGroupId ? (
          <GroupDetailView
            groupId={selectedGroupId}
            onBack={() => {
              setSelectedGroupId(null);
              setCurrentView(ViewState.GROUPS);
            }}
            onCreatePost={() => setIsPostModalOpen(true)}
          />
        ) : <HomeView user={user} />;
      case ViewState.SERVICES:
        return (
          <MarketplaceView 
            onChangeView={setCurrentView} 
            onRequestService={() => setIsServiceRequestModalOpen(true)}
            onSelectService={(serviceId) => {
              setSelectedServiceId(serviceId);
              setCurrentView(ViewState.SERVICE_DETAIL);
            }}
          />
        );
      case ViewState.MY_REQUESTS:
        return (
          <MyRequestsView 
            onBack={() => setCurrentView(ViewState.SERVICES)}
            onChat={() => setCurrentView(ViewState.CHATS)}
          />
        );
      case ViewState.OPEN_REQUESTS:
        return (
          <OpenRequestsView 
            onBack={() => setCurrentView(ViewState.SERVICES)}
            onChat={() => setCurrentView(ViewState.CHATS)}
          />
        );
      case ViewState.AI_GUIDE:
        return <AiGuideView />;
      case ViewState.ADMIN:
        // Verificar se usuário é admin antes de mostrar
        if (!authUser || authUser.role !== 'admin') {
          return <HomeView user={user} />;
        }
        return <AdminPanel exitAdmin={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.CHATS:
        return <ChatView onBack={() => setCurrentView(ViewState.HOME)} />;
      case ViewState.PROFILE:
        return (
          <ProfileView 
            user={user} 
            setView={(view) => {
              if (view === ViewState.PROVIDER_DASHBOARD) {
                setCurrentView(ViewState.PROVIDER_DASHBOARD);
              } else {
                setCurrentView(view);
              }
            }} 
          />
        );
      case ViewState.PROVIDER_DASHBOARD:
        return <ProviderDashboard onBack={() => setCurrentView(ViewState.PROFILE)} />;
      case ViewState.VERIFICATION:
        return (
            <VerificationFlow 
                user={user} 
                onBack={() => setCurrentView(ViewState.PROFILE)}
                onComplete={() => {
                    // Score update será feito pelo backend
                    setCurrentView(ViewState.PROFILE);
                }} 
            />
        );
      case ViewState.PUBLIC_PROFILE:
        // Se selectedUserId existe, criar user object básico (PublicProfileView vai buscar dados completos)
        const profileUser: User = selectedUserId ? {
          id: selectedUserId,
          name: 'Carregando...',
          avatar: '',
          location: '',
          role: 'imigrant',
          raizCoins: 0,
          badges: [],
          trustScore: 0,
          verificationSteps: [],
          reviews: [],
          joinDate: new Date().toLocaleDateString('pt-BR'),
        } : (inspectedUser || TRUSTED_PROVIDER);
        
        return (
            <PublicProfileView 
              user={profileUser}
              onBack={() => {
                setInspectedUser(null);
                setSelectedUserId(null);
                setCurrentView(ViewState.HOME);
              }}
              onChat={() => setCurrentView(ViewState.CHATS)}
            />
        );
      case ViewState.LOGIN:
        return (
          <LoginView
            onLoginSuccess={() => setCurrentView(ViewState.HOME)}
            onSwitchToSignup={() => setCurrentView(ViewState.SIGNUP)}
          />
        );
      case ViewState.SIGNUP:
        return (
          <SignupView
            onSignupSuccess={() => setCurrentView(ViewState.HOME)}
            onSwitchToLogin={() => setCurrentView(ViewState.LOGIN)}
          />
        );
      case ViewState.SERVICE_DETAIL:
        return selectedServiceId ? (
          <ServiceDetailView
            serviceId={selectedServiceId}
            onBack={() => {
              setSelectedServiceId(null);
              setCurrentView(ViewState.SERVICES);
            }}
            onChat={() => setCurrentView(ViewState.CHATS)}
          />
        ) : <MarketplaceView onChangeView={setCurrentView} onRequestService={() => setIsServiceRequestModalOpen(true)} />;
      case ViewState.POST_DETAIL:
        return selectedPostId ? (
          <PostDetailView
            postId={selectedPostId}
            onBack={() => {
              setSelectedPostId(null);
              setCurrentView(ViewState.FEED);
            }}
          />
        ) : <HomeView user={user} />;
      default:
        return <HomeView user={user} />;
    }
  };

  return (
    <div className={containerClass}>
        {/* Mobile Header (Only show if NOT in Admin/Full views) */}
        {isMobileView && currentView !== ViewState.CHATS && currentView !== ViewState.VERIFICATION && currentView !== ViewState.PUBLIC_PROFILE && currentView !== ViewState.MY_REQUESTS && (
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center max-w-md mx-auto">
                <div className="flex items-center space-x-2">
                    <div 
                        className="cursor-pointer"
                        onClick={() => setCurrentView(ViewState.HOME)}
                    >
                        <span className="font-bold text-xl text-miggro-teal" style={{ color: '#1E8277' }}>
                            Miggro
                        </span>
                    </div>
                    {authUser && (
                        <button
                            onClick={async () => {
                                await signOut();
                                setCurrentView(ViewState.LOGIN);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 px-2 py-1 border border-red-200 rounded"
                            title="Sair"
                        >
                            Sair
                        </button>
                    )}
                </div>
                
                <div className="flex items-center space-x-3">
                    <CoinBalance amount={user.raizCoins} />
                    <NotificationsBell
                      onNotificationClick={(notification) => {
                        if (notification.action_url) {
                          // Navegar baseado na URL da ação
                          if (notification.action_url.includes('/services/requests/')) {
                            setCurrentView(ViewState.MY_REQUESTS);
                          } else if (notification.action_url.includes('/chats')) {
                            setCurrentView(ViewState.CHATS);
                          }
                        }
                      }}
                    />
                    <button 
                        onClick={() => setCurrentView(ViewState.CHATS)}
                        className="text-gray-500 hover:text-miggro-teal transition-colors"
                    >
                        <MessageCircle size={24} />
                    </button>
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="relative p-0.5 rounded-full border-2 border-transparent hover:border-brand-200 transition-all"
                        >
                            <img 
                                src={user.avatar} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full object-cover shadow-sm"
                            />
                        </button>
                        {/* Dropdown menu para logout rápido */}
                        {authUser && isProfileMenuOpen && (
                            <>
                                {/* Overlay para fechar ao clicar fora */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsProfileMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <button
                                        onClick={() => {
                                            setIsProfileMenuOpen(false);
                                            setCurrentView(ViewState.PROFILE);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                    >
                                        Ver Perfil
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setIsProfileMenuOpen(false);
                                            await signOut();
                                            setCurrentView(ViewState.LOGIN);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg border-t border-gray-100"
                                    >
                                        Sair
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <main className={isMobileView ? "h-[calc(100vh-64px)]" : "h-screen"}>
            {renderView()}
        </main>

        {/* Modals */}
        {isPostModalOpen && (
          <CreatePostModal 
            onClose={() => setIsPostModalOpen(false)}
            onSuccess={() => {
              // Recarregar feed se estiver na view de feed
              if (currentView === ViewState.FEED) {
                // A CommunityView vai recarregar automaticamente via useEffect
              }
            }}
          />
        )}
        {isGroupModalOpen && (
          <CreateGroupModal 
            onClose={() => setIsGroupModalOpen(false)}
            onSuccess={() => {
              // Recarregar grupos se estiver na view de grupos
              if (currentView === ViewState.GROUPS) {
                // A CommunityView vai recarregar automaticamente
              }
            }}
          />
        )}
        {isServiceRequestModalOpen && (
          <CreateServiceRequestModal 
            onClose={() => setIsServiceRequestModalOpen(false)}
            onSuccess={() => {
              // Recarregar se estiver na view de requests
              if (currentView === ViewState.MY_REQUESTS) {
                // Recarregar será feito automaticamente
              }
            }}
          />
        )}

        {/* Search Modal */}
        {isSearchModalOpen && (
          <SearchModal
            onClose={() => setIsSearchModalOpen(false)}
            onSelectUser={(userId) => {
              setSelectedUserId(userId);
              setCurrentView(ViewState.PUBLIC_PROFILE);
              setIsSearchModalOpen(false);
            }}
            onSelectService={(serviceId) => {
              setSelectedServiceId(serviceId);
              setCurrentView(ViewState.SERVICE_DETAIL);
              setIsSearchModalOpen(false);
            }}
            onSelectPost={(postId) => {
              setSelectedPostId(postId);
              setCurrentView(ViewState.POST_DETAIL);
              setIsSearchModalOpen(false);
            }}
          />
        )}

        {/* Search Button (FAB) */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="fixed bottom-24 right-4 z-40 bg-miggro-teal text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-colors"
          aria-label="Buscar"
        >
          <Search size={24} />
        </button>

        {/* Navigation */}
        <BottomNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
