import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, User, Briefcase, FileText, Users } from 'lucide-react';
import { searchService } from '../lib/supabase/search';
import { useAuth } from '../contexts/AuthContext';

interface SearchModalProps {
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
  onSelectService?: (serviceId: string) => void;
  onSelectPost?: (postId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  onClose, 
  onSelectUser, 
  onSelectService,
  onSelectPost 
}) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'services' | 'users'>('all');
  const [results, setResults] = useState<{
    posts?: any[];
    services?: any[];
    users?: any[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Carregar buscas recentes do localStorage
    const saved = localStorage.getItem('miggro_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (err) {
        console.error('Erro ao carregar buscas recentes:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (query.trim().length < 2) {
      setResults({});
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [query, activeTab]);

  const performSearch = async () => {
    if (query.trim().length < 2) return;

    setLoading(true);
    try {
      if (activeTab === 'all') {
        const { data, error } = await searchService.search(query, {
          types: ['posts', 'services', 'users'],
          limit: 5,
        });
        if (!error && data) {
          setResults(data);
        }
      } else if (activeTab === 'posts') {
        const { data, error } = await searchService.searchPosts(query, 20);
        if (!error && data) {
          setResults({ posts: data });
        }
      } else if (activeTab === 'services') {
        const { data, error } = await searchService.searchServices(query, 20);
        if (!error && data) {
          setResults({ services: data });
        }
      } else if (activeTab === 'users') {
        const { data, error } = await searchService.searchUsers(query, 20);
        if (!error && data) {
          setResults({ users: data });
        }
      }
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar posts, serviços, usuários..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
              autoFocus
            />
          </div>
          <button onClick={onClose} className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all' 
                ? 'border-miggro-teal text-miggro-teal' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'posts' 
                ? 'border-miggro-teal text-miggro-teal' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'services' 
                ? 'border-miggro-teal text-miggro-teal' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Serviços
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users' 
                ? 'border-miggro-teal text-miggro-teal' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Usuários
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-miggro-teal mr-2" size={20} />
              <span className="text-gray-600 text-sm">Buscando...</span>
            </div>
          ) : query.trim().length < 2 ? (
            <div>
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Buscas Recentes</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-center py-12 text-gray-400">
                <Search size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Digite pelo menos 2 caracteres para buscar</p>
              </div>
            </div>
          ) : (
            <>
              {/* Posts */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts && results.posts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                    <FileText size={14} className="mr-2" />
                    Posts ({results.posts.length})
                  </h3>
                  <div className="space-y-2">
                    {results.posts.map((post: any) => {
                      const author = post.author || {};
                      return (
                        <button
                          key={post.id}
                          onClick={() => {
                            if (onSelectPost) onSelectPost(post.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <img 
                              src={author.avatar_url || 'https://via.placeholder.com/24'} 
                              alt={author.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs font-medium text-gray-700">{author.name || 'Usuário'}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Services */}
              {(activeTab === 'all' || activeTab === 'services') && results.services && results.services.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                    <Briefcase size={14} className="mr-2" />
                    Serviços ({results.services.length})
                  </h3>
                  <div className="space-y-2">
                    {results.services.map((service: any) => {
                      const provider = service.provider || {};
                      return (
                        <button
                          key={service.id}
                          onClick={() => {
                            if (onSelectService) onSelectService(service.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-900">{service.title}</span>
                            <span className="text-xs font-bold text-miggro-teal">
                              {service.currency === 'RAIZ' ? `${service.price} MG` : `€${service.price?.toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{provider.name || 'Prestador'}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results.users && results.users.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                    <Users size={14} className="mr-2" />
                    Usuários ({results.users.length})
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((profile: any) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          if (onSelectUser) onSelectUser(profile.id);
                          onClose();
                        }}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                      >
                        <img 
                          src={profile.avatar_url || 'https://via.placeholder.com/40'} 
                          alt={profile.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-gray-900">{profile.name}</span>
                            {profile.verification_status === 'verified' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓</span>
                            )}
                          </div>
                          {profile.bio && (
                            <p className="text-xs text-gray-500 line-clamp-1">{profile.bio}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {(!results.posts || results.posts.length === 0) &&
               (!results.services || results.services.length === 0) &&
               (!results.users || results.users.length === 0) && (
                <div className="text-center py-12 text-gray-400">
                  <Search size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum resultado encontrado</p>
                  <p className="text-xs mt-1">Tente usar palavras-chave diferentes</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
