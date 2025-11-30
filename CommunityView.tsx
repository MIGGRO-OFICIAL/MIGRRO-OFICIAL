
import React from 'react';
import { POSTS, GROUPS } from '../services/mockData';
import { MessageCircle, Heart, Share2, Plus, Users, Lock, ShieldCheck, Star, Play } from 'lucide-react';

interface CommunityViewProps {
    mode: 'feed' | 'groups';
    onOpenGroup?: (groupId: string) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ mode, onOpenGroup }) => {
  
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
        {mode === 'groups' ? (
             <div className="grid gap-4">
                {GROUPS.map((group) => (
                    <div key={group.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-24 bg-gray-200 relative">
                            <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center">
                                <Users size={10} className="mr-1" />
                                {group.members} membros
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900">{group.name}</h3>
                                {group.isPrivate && <Lock size={14} className="text-gray-400" />}
                            </div>
                            
                            {/* Safety Rating for Groups */}
                            <div className="flex items-center mb-2">
                                <div className="flex text-yellow-400 mr-1">
                                    <Star size={10} fill="currentColor" />
                                    <span className="text-gray-600 text-[10px] ml-1 font-medium">{group.safetyRating}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">({group.reviewsCount} avaliações)</span>
                                {group.safetyRating >= 4.5 && (
                                    <span className="ml-auto text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
                                        <ShieldCheck size={10} className="mr-1" /> Seguro
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{group.description}</p>
                            <button className="w-full py-2 border border-brand-200 text-brand-700 font-medium text-xs rounded-lg hover:bg-brand-50 transition-colors">
                                {group.isPrivate ? 'Pedir para entrar' : 'Entrar no Grupo'}
                            </button>
                        </div>
                    </div>
                ))}
             </div>
        ) : (
            <div className="space-y-4">
                {POSTS.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full border border-gray-100" />
                        <div>
                        <h3 className="font-semibold text-sm text-gray-900">{post.authorName}</h3>
                        <p className="text-xs text-gray-400">{post.timestamp}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${
                        post.type === 'help_request' ? 'bg-orange-100 text-orange-700' : 
                        post.type === 'event' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                        {post.type === 'help_request' ? 'Ajuda' : post.type}
                    </span>
                    </div>

                    <p className="text-gray-800 text-sm mb-3 leading-relaxed whitespace-pre-line">{post.content}</p>

                    {post.image && (
                        <img src={post.image} alt="Post content" className="w-full h-48 object-cover rounded-lg mb-3" />
                    )}

                    {post.videoUrl && getYouTubeEmbedUrl(post.videoUrl) && (
                        <div className="w-full aspect-video rounded-lg mb-3 overflow-hidden bg-black relative group">
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={getYouTubeEmbedUrl(post.videoUrl)!} 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-miggro-teal bg-brand-50 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors group">
                        <Heart size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-xs">{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                        <Share2 size={18} />
                    </button>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>

      {/* FAB to create post - Only show on Feed */}
      {mode === 'feed' && (
        <button className="fixed bottom-20 right-4 bg-miggro-teal text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-600 transition-transform active:scale-95 z-40">
            <Plus size={28} />
        </button>
      )}
    </div>
  );
};

export default CommunityView;
