
import React, { useState, useEffect } from 'react';
import { POSTS, GROUPS } from '../services/mockData';
import { MessageCircle, Heart, Share2, Plus, Users, Lock, ShieldCheck, Star, Play, Loader2 } from 'lucide-react';
import { postsService } from '../lib/supabase/posts';
import { groupsService } from '../lib/supabase/groups';
import { useAuth } from '../contexts/AuthContext';
import CommentsModal from '../components/CommentsModal';

interface CommunityViewProps {
    mode: 'feed' | 'groups';
    onOpenGroup?: (groupId: string) => void;
    onCreatePost?: () => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ mode, onOpenGroup, onCreatePost, onSelectUser }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
  
  // Carregar dados
  useEffect(() => {
    loadData();
  }, [mode]);

  const loadData = async () => {
    // MOSTRAR MOCK DATA IMEDIATAMENTE para resposta rápida
    if (mode === 'feed') {
      setPosts(POSTS as any);
    } else {
      setGroups(GROUPS as any);
    }
    setLoading(false);
    
    // Carregar dados reais em background (sem bloquear UI)
    const startTime = performance.now();
    
    try {
      if (mode === 'feed') {
        console.log('[CommunityView] Carregando posts do Supabase em background...');
        
        // Timeout de 2 segundos - se demorar mais, usar mock
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const dataPromise = postsService.list({ limit: 20 });
        
        try {
          const { data: postsData, error } = await Promise.race([dataPromise, timeoutPromise]) as any;
          
          if (error) {
            console.warn('[CommunityView] Erro ao carregar posts, usando mock:', error);
            return; // Já está usando mock
          }
          
          if (postsData && postsData.length > 0) {
            console.log(`[CommunityView] ✅ ${postsData.length} posts carregados do Supabase`);
            setPosts(postsData);
            
            // Verificar likes em background (não bloqueia)
            if (user && postsData.length > 0) {
              const postIds = postsData.map((post: any) => post.id);
              postsService.getLikedPosts(postIds)
                .then(({ data: likedPostIds }) => {
                  if (likedPostIds) {
                    setLikedPosts(new Set(likedPostIds));
                  }
                })
                .catch(err => console.warn('[CommunityView] Erro ao verificar likes:', err));
            }
          } else {
            console.log('[CommunityView] Nenhum post no Supabase, mantendo mock');
          }
        } catch (timeoutError) {
          console.warn('[CommunityView] ⏱️ Timeout ao carregar posts, usando mock data');
          // Já está usando mock, não precisa fazer nada
        }
      } else {
        console.log('[CommunityView] Carregando grupos do Supabase em background...');
        
        // Timeout de 2 segundos
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const dataPromise = groupsService.list({ limit: 20 });
        
        try {
          const { data: groupsData, error } = await Promise.race([dataPromise, timeoutPromise]) as any;
          
          if (error) {
            console.warn('[CommunityView] Erro ao carregar grupos, usando mock:', error);
            return; // Já está usando mock
          }
          
          if (groupsData && groupsData.length > 0) {
            console.log(`[CommunityView] ✅ ${groupsData.length} grupos carregados do Supabase`);
            setGroups(groupsData);
          } else {
            console.log('[CommunityView] Nenhum grupo no Supabase, mantendo mock');
          }
        } catch (timeoutError) {
          console.warn('[CommunityView] ⏱️ Timeout ao carregar grupos, usando mock data');
          // Já está usando mock, não precisa fazer nada
        }
      }
      
      const endTime = performance.now();
      console.log(`[CommunityView] Background load concluído em ${(endTime - startTime).toFixed(2)}ms`);
    } catch (err) {
      console.warn('[CommunityView] Erro no background load (usando mock):', err);
      // Já está usando mock, não precisa fazer nada
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const { data, error } = await postsService.toggleLike(postId);
    if (!error && data) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      // Recarregar posts para atualizar contadores
      loadData();
    }
  };

  // Helper to extract YouTube ID
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="pb-24 pt-4 max-w-md mx-auto relative h-full">
      <div className="px-4 mb-4 sticky top-0 bg-[#f8fafc] z-10 py-2">
        <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'feed' ? 'Feed Social' : 'Grupos & Comunidades'}
        </h1>
        <p className="text-xs text-gray-500">
            {mode === 'feed' 
                ? 'O que está acontecendo na comunidade agora.' 
                : 'Encontre sua tribo e conecte-se com segurança.'}
        </p>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-miggro-teal" size={32} />
            <span className="ml-3 text-gray-600">Carregando...</span>
          </div>
        ) : mode === 'groups' ? (
             <div className="grid gap-4">
                {(groups.length > 0 ? groups : GROUPS).map((group: any) => {
                  const safetyRating = group.safety_rating || group.safetyRating || 0;
                  const membersCount = group.members_count || group.members || 0;
                  const reviewsCount = group.reviews_count || group.reviewsCount || 0;
                  const isPrivate = group.is_private !== undefined ? group.is_private : group.isPrivate;
                  
                  return (
                    <div key={group.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-24 bg-gray-200 relative">
                            <img src={group.image_url || group.image || 'https://via.placeholder.com/300x150'} alt={group.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center">
                                <Users size={10} className="mr-1" />
                                {membersCount} membros
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900">{group.name}</h3>
                                {isPrivate && <Lock size={14} className="text-gray-400" />}
                            </div>
                            
                            {/* Safety Rating for Groups */}
                            {safetyRating > 0 && (
                              <div className="flex items-center mb-2">
                                  <div className="flex text-yellow-400 mr-1">
                                      <Star size={10} fill="currentColor" />
                                      <span className="text-gray-600 text-[10px] ml-1 font-medium">{safetyRating.toFixed(1)}</span>
                                  </div>
                                  {reviewsCount > 0 && (
                                    <span className="text-[10px] text-gray-400">({reviewsCount} avaliações)</span>
                                  )}
                                  {safetyRating >= 4.5 && (
                                      <span className="ml-auto text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
                                          <ShieldCheck size={10} className="mr-1" /> Seguro
                                      </span>
                                  )}
                              </div>
                            )}

                            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{group.description || ''}</p>
                            <button 
                              onClick={async () => {
                                if (!user) {
                                  alert('Você precisa estar logado para entrar em um grupo');
                                  return;
                                }
                                
                                const { error } = await groupsService.joinGroup(group.id);
                                if (error) {
                                  alert('Erro ao entrar no grupo: ' + error.message);
                                } else {
                                  alert('Você entrou no grupo!');
                                  loadData(); // Recarregar grupos
                                }
                              }}
                              className="w-full py-2 border border-brand-200 text-brand-700 font-medium text-xs rounded-lg hover:bg-brand-50 transition-colors"
                            >
                                {isPrivate ? 'Pedir para entrar' : 'Entrar no Grupo'}
                            </button>
                        </div>
                    </div>
                  );
                })}
             </div>
        ) : (
            <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Nenhum post ainda. Seja o primeiro a compartilhar!</p>
                  </div>
                ) : (
                  posts.map((post: any) => {
                    const isLiked = likedPosts.has(post.id);
                    const author = post.author || {};
                    const postType = post.post_type || 'general';
                    
                    return (
                      <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                if (onSelectUser && post.author_id) {
                                  onSelectUser(post.author_id);
                                }
                              }}
                              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                            >
                              <img 
                                src={author.avatar_url || 'https://via.placeholder.com/40'} 
                                alt={author.name || 'Usuário'} 
                                className="w-10 h-10 rounded-full border border-gray-100" 
                              />
                              <div>
                                <h3 className="font-semibold text-sm text-gray-900">{author.name || 'Usuário'}</h3>
                                <p className="text-xs text-gray-400">
                                  {post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR', { 
                                    day: 'numeric', 
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Agora'}
                                </p>
                              </div>
                            </button>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${
                            postType === 'help_request' ? 'bg-orange-100 text-orange-700' : 
                            postType === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {postType === 'help_request' ? 'Ajuda' : postType === 'event' ? 'Evento' : 'Geral'}
                          </span>
                        </div>

                        <p className="text-gray-800 text-sm mb-3 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {post.image_urls && post.image_urls.length > 0 && (
                          <img src={post.image_urls[0]} alt="Post content" className="w-full h-48 object-cover rounded-lg mb-3" />
                        )}

                        {post.video_url && getYouTubeEmbedUrl(post.video_url) && (
                          <div className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-black relative group">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              src={getYouTubeEmbedUrl(post.video_url)!} 
                              title="YouTube video player" 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag: string) => (
                              <span key={tag} className="text-[10px] text-miggro-teal bg-brand-50 px-2 py-0.5 rounded-full">#{tag}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-gray-500">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-1 transition-colors group ${
                              isLiked ? 'text-red-500' : 'hover:text-red-500'
                            }`}
                          >
                            <Heart 
                              size={18} 
                              className={`group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} 
                            />
                            <span className="text-xs">{post.likes_count || 0}</span>
                          </button>
                          <button 
                            onClick={() => setActiveCommentsPost(post.id)}
                            className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle size={18} />
                            <span className="text-xs">{post.comments_count || 0}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                            <Share2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
            </div>
        )}
      </div>

      {/* FAB to create post - Only show on Feed */}
      {mode === 'feed' && (
        <button 
          onClick={onCreatePost}
          className="fixed bottom-20 right-4 bg-miggro-teal text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-600 transition-transform active:scale-95 z-40"
        >
            <Plus size={28} />
        </button>
      )}

      {/* Comments Modal */}
      {activeCommentsPost && (
        <CommentsModal
          postId={activeCommentsPost}
          onClose={() => {
            setActiveCommentsPost(null);
            loadData(); // Recarregar para atualizar contador
          }}
          onCommentAdded={() => loadData()}
        />
      )}
    </div>
  );
};

export default CommunityView;
