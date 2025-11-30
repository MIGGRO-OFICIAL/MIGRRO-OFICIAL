<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Loader2, Trash2 } from 'lucide-react';
import { postsService } from '../lib/supabase/posts';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes_count?: number;
}

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, onClose, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await postsService.listComments(postId);
      if (error) {
        console.error('Erro ao carregar comentários:', error);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await postsService.createComment(postId, newComment.trim());
      if (error) {
        console.error('Erro ao criar comentário:', error);
      } else {
        setNewComment('');
        await loadComments();
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    
    const { data, error } = await postsService.toggleCommentLike(commentId);
    if (!error && data) {
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      await loadComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;
    
    const { error } = await postsService.deleteComment(commentId);
    if (!error) {
      await loadComments();
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-up md:zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Comentários</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-miggro-teal" size={24} />
              <span className="ml-2 text-gray-600 text-sm">Carregando comentários...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = likedComments.has(comment.id);
              const isAuthor = user && comment.author.id === user.id;
              
              return (
                <div key={comment.id} className="flex space-x-3">
                  <img 
                    src={comment.author.avatar_url || 'https://via.placeholder.com/40'} 
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{comment.author.name}</h4>
                          <p className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {isAuthor && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Deletar comentário"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <div className="mt-1 flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center space-x-1 text-xs transition-colors ${
                          isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          size={14} 
                          className={isLiked ? 'fill-current' : ''}
                        />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        {user && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-miggro-teal focus:outline-none text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || sending}
                className="p-2 bg-miggro-teal text-white rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
=======
import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Loader2, Trash2 } from 'lucide-react';
import { postsService } from '../lib/supabase/posts';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  likes_count?: number;
}

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, onClose, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await postsService.listComments(postId);
      if (error) {
        console.error('Erro ao carregar comentários:', error);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await postsService.createComment(postId, newComment.trim());
      if (error) {
        console.error('Erro ao criar comentário:', error);
      } else {
        setNewComment('');
        await loadComments();
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;
    
    const { data, error } = await postsService.toggleCommentLike(commentId);
    if (!error && data) {
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });
      await loadComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;
    
    const { error } = await postsService.deleteComment(commentId);
    if (!error) {
      await loadComments();
      if (onCommentAdded) onCommentAdded();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-up md:zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Comentários</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-miggro-teal" size={24} />
              <span className="ml-2 text-gray-600 text-sm">Carregando comentários...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = likedComments.has(comment.id);
              const isAuthor = user && comment.author.id === user.id;
              
              return (
                <div key={comment.id} className="flex space-x-3">
                  <img 
                    src={comment.author.avatar_url || 'https://via.placeholder.com/40'} 
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{comment.author.name}</h4>
                          <p className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {isAuthor && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Deletar comentário"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    <div className="mt-1 flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center space-x-1 text-xs transition-colors ${
                          isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart 
                          size={14} 
                          className={isLiked ? 'fill-current' : ''}
                        />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        {user && (
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-miggro-teal focus:outline-none text-sm"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || sending}
                className="p-2 bg-miggro-teal text-white rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentsModal;
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
