import React, { useState, useEffect } from 'react';
import { ChevronLeft, Heart, MessageCircle, Share2, Loader2, MoreVertical } from 'lucide-react';
import { postsService } from '../lib/supabase/posts';
import { useAuth } from '../contexts/AuthContext';
import CommentsModal from '../components/CommentsModal';

interface PostDetailViewProps {
  postId: string;
  onBack: () => void;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ postId, onBack }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await postsService.getById(postId);
      if (error) {
        console.error('Erro ao carregar post:', error);
      } else if (data) {
        setPost(data);
        setLikesCount(data.likes_count || 0);
        setCommentsCount(data.comments_count || 0);
        
        // Verificar se usuário curtiu
        if (user) {
          const { data: liked } = await postsService.isLiked(postId);
          setIsLiked(liked || false);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    
    const { data, error } = await postsService.toggleLike(postId);
    if (!error && data) {
      setIsLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-miggro-teal" size={32} />
        <span className="ml-3 text-gray-600">Carregando post...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Post não encontrado</p>
          <button
            onClick={onBack}
            className="text-miggro-teal hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const author = post.author || {};
  const postType = post.post_type || 'general';

  return (
    <div className="h-full bg-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3 sticky top-0 z-10 bg-white">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Post</h1>
        <button className="ml-auto p-1 hover:bg-gray-100 rounded-full">
          <MoreVertical size={20} className="text-gray-600" />
        </button>
      </header>

      {/* Post Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="p-4">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={author.avatar_url || 'https://via.placeholder.com/40'}
              alt={author.name || 'Usuário'}
              className="w-10 h-10 rounded-full border border-gray-100"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">{author.name || 'Usuário'}</h3>
              <p className="text-xs text-gray-400">
                {post.created_at ? new Date(post.created_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Agora'}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${
              postType === 'help_request' ? 'bg-orange-100 text-orange-700' :
              postType === 'event' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {postType === 'help_request' ? 'Ajuda' : postType === 'event' ? 'Evento' : 'Geral'}
            </span>
          </div>

          {/* Post Content */}
          <p className="text-gray-800 text-sm mb-4 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>

          {/* Images */}
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mb-4 space-y-2">
              {post.image_urls.map((imgUrl: string, index: number) => (
                <img
                  key={index}
                  src={imgUrl}
                  alt={`Post image ${index + 1}`}
                  className="w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* Video */}
          {post.video_url && getYouTubeEmbedUrl(post.video_url) && (
            <div className="w-full aspect-video rounded-lg mb-4 overflow-hidden bg-black relative">
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

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] text-miggro-teal bg-brand-50 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            <button
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share2 size={20} />
              <span className="text-sm font-medium">Compartilhar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {isCommentsOpen && (
        <CommentsModal
          postId={postId}
          onClose={() => setIsCommentsOpen(false)}
          onCommentAdded={() => {
            setCommentsCount(prev => prev + 1);
            loadPost();
          }}
        />
      )}
    </div>
  );
};

export default PostDetailView;
