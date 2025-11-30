
import React, { useState, useEffect } from 'react';
import { User, Post, ServiceListing } from '../types';
import { POSTS, SERVICES } from '../services/mockData';
import { ShieldCheck, MapPin, Star, ChevronLeft, Flag, CheckCircle2, Grid, Briefcase, Heart, MessageCircle, Play, Loader2 } from 'lucide-react';
import TrustBadge from '../components/TrustBadge';
import { postsService } from '../lib/supabase/posts';
import { servicesService } from '../lib/supabase/services';
import { reviewsService } from '../lib/supabase/reviews';
import { usersService } from '../lib/supabase/users';
import { analyticsService } from '../lib/supabase/analytics';
import { useAuth } from '../contexts/AuthContext';

interface PublicProfileViewProps {
  user: User;
  onBack: () => void;
  onChat: () => void;
}

const PublicProfileView: React.FC<PublicProfileViewProps> = ({ user, onBack, onChat }) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'services' | 'reviews'>('feed');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userServices, setUserServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      loadProfileData();
      // Registrar visualização de perfil
      analyticsService.trackProfileView(user.id, 'direct');
    }
  }, [user.id]);

  const loadProfileData = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      // Buscar perfil completo
      const { data: profile, error: profileError } = await usersService.getPublicProfile(user.id);
      if (!profileError && profile) {
        setProfileData(profile);
        setIsFollowing(profile.is_following || false);
        
        // Atualizar dados do user prop com dados do banco
        if (profile.name) user.name = profile.name;
        if (profile.avatar_url) user.avatar = profile.avatar_url;
        if (profile.bio) user.bio = profile.bio;
        if (profile.location) user.location = profile.location;
        if (profile.trust_score) user.trustScore = profile.trust_score;
        if (profile.subscriber_count) user.subscriberCount = profile.subscriber_count;
        if (profile.following_count) user.followingCount = profile.following_count;
      }

      // Buscar posts do usuário
      const { data: posts, error: postsError } = await postsService.list({ limit: 20 });
      if (!postsError && posts) {
        const filtered = posts.filter((p: any) => p.author_id === user.id);
        setUserPosts(filtered);
      } else {
        setUserPosts(POSTS.filter(p => p.authorId === user.id) as any);
      }

      // Buscar serviços do usuário
      const { data: services, error: servicesError } = await servicesService.listServices({ limit: 20 });
      if (!servicesError && services) {
        const filtered = services.filter((s: any) => s.provider_id === user.id);
        setUserServices(filtered);
      } else {
        setUserServices(SERVICES.filter(s => s.providerId === user.id) as any);
      }

      // Buscar reviews do usuário (se for provider)
      const { data: providerReviews, error: reviewsError } = await reviewsService.listProviderReviews(user.id, 10);
      if (!reviewsError && providerReviews) {
        setReviews(providerReviews);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      // Fallback para mock data
      setUserPosts(POSTS.filter(p => p.authorId === user.id) as any);
      setUserServices(SERVICES.filter(s => s.providerId === user.id) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para seguir usuários');
      return;
    }

    try {
      const { error } = await usersService.toggleFollow(user.id);
      if (error) {
        alert('Erro: ' + error.message);
      } else {
        setIsFollowing(!isFollowing);
        await loadProfileData();
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

   // Helper to extract YouTube ID (duplicated for component independence)
   const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="h-full bg-white overflow-y-auto pb-24 max-w-md mx-auto">
      {/* Header Image/Banner */}
      <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 relative">
        <button onClick={onBack} className="absolute top-4 left-4 text-white p-2 bg-black/20 rounded-full backdrop-blur-sm z-10">
            <ChevronLeft size={20} />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-12 mb-2 relative">
        <div className="flex justify-between items-end">
            <div className="relative">
                <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white object-cover" alt={user.name} />
                <div className="absolute bottom-1 right-0">
                    <TrustBadge score={user.trustScore} size="sm" />
                </div>
            </div>
            
            {/* Stats */}
            <div className="flex space-x-4 mb-2">
                <div className="text-center">
                    <span className="block font-bold text-gray-900">{profileData?.followers_count || user.subscriberCount || 0}</span>
                    <span className="text-[10px] text-gray-500">Seguidores</span>
                </div>
                <div className="text-center">
                     <span className="block font-bold text-gray-900">{profileData?.following_count || user.followingCount || 0}</span>
                    <span className="text-[10px] text-gray-500">Seguindo</span>
                </div>
                <div className="text-center">
                     <span className="block font-bold text-gray-900">{userServices.length}</span>
                    <span className="text-[10px] text-gray-500">Serviços</span>
                </div>
            </div>
        </div>
        
        <div className="mt-3">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
                {user.name}
                {user.trustScore >= 80 && <ShieldCheck size={18} className="ml-2 text-blue-500" fill="currentColor" />}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
            <div className="flex items-center text-gray-400 text-xs mt-2">
                <MapPin size={12} className="mr-1" /> {user.location}
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
             <button 
               onClick={handleFollow}
               className={`flex-1 py-2 rounded-lg font-semibold shadow-sm transition-colors text-sm ${
                 isFollowing 
                   ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                   : 'bg-brand-600 text-white hover:bg-brand-700'
               }`}
             >
                {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
            <button onClick={onChat} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
                Mensagem
            </button>
            <button className="px-3 py-2 bg-pink-100 text-pink-600 rounded-lg font-semibold hover:bg-pink-200 transition-colors text-sm flex items-center">
                <Heart size={16} fill="currentColor" />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mt-4 sticky top-0 bg-white z-10">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'feed' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}
          >
              <Grid size={18} className="mr-2" /> Feed
          </button>
          <button 
             onClick={() => setActiveTab('services')}
             className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'services' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}
          >
              <Briefcase size={18} className="mr-2" /> Serviços ({userServices.length})
          </button>
      </div>

      {/* Content Area */}
      <div className="bg-gray-50 min-h-[300px] p-1">
        
        {/* FEED TAB */}
        {activeTab === 'feed' && (
            <div className="grid grid-cols-3 gap-1">
                {userPosts.length > 0 ? userPosts.map((post) => (
                    <div key={post.id} className="aspect-square bg-gray-200 relative group cursor-pointer overflow-hidden">
                        {post.videoUrl ? (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                                <Play size={24} className="text-white opacity-80" fill="currentColor" />
                            </div>
                        ) : post.image ? (
                             <img src={post.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full bg-white p-2 flex items-center justify-center text-[10px] text-gray-500 text-center">
                                {post.content.substring(0, 50)}...
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="col-span-3 py-10 text-center text-gray-400">
                        Nenhuma publicação ainda.
                    </div>
                )}
            </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
            <div className="space-y-2 p-3">
                 {userServices.length > 0 ? userServices.map((service) => (
                      <div key={service.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                          <div>
                              <h4 className="font-bold text-gray-900 text-sm">{service.title}</h4>
                              <p className="text-xs text-gray-500">{service.category}</p>
                          </div>
                          <div className="text-right">
                              <span className="block font-bold text-brand-600">
                                {service.currency === 'EUR' ? `€${service.price}` : `${service.price} MG`}
                              </span>
                              <button className="text-[10px] bg-gray-900 text-white px-2 py-1 rounded mt-1">Contratar</button>
                          </div>
                      </div>
                 )) : (
                    <div className="py-10 text-center text-gray-400">
                        Nenhum serviço oferecido.
                    </div>
                )}
            </div>
        )}

      </div>
      
      {/* Support Banner (Patron) */}
      <div className="p-4 mt-2">
         <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 text-white flex items-center justify-between shadow-lg">
             <div>
                 <h4 className="font-bold text-sm">Apoie {user.name.split(' ')[0]}</h4>
                 <p className="text-xs opacity-90">Contribua para que ela continue ajudando a comunidade.</p>
             </div>
             <button className="bg-white text-purple-600 text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                 Apoiar Mensalmente
             </button>
         </div>
      </div>
      
    </div>
  );
};

export default PublicProfileView;
