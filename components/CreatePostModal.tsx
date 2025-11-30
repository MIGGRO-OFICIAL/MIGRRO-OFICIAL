
import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Send, Loader2, XCircle } from 'lucide-react';
import { Post } from '../types';
import { postsService } from '../lib/supabase/posts';
import { storageService } from '../lib/supabase/storage';
import { useAuth } from '../contexts/AuthContext';

interface CreatePostModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  groupId?: string; // Se fornecido, o post será criado no grupo
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onSuccess, groupId }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tags = ['Geral', 'Ajuda', 'Evento', 'Dica', 'Denúncia'];

  const getPostType = (tag: string): 'general' | 'help_request' | 'event' => {
    if (tag === 'Ajuda') return 'help_request';
    if (tag === 'Evento') return 'event';
    return 'general';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limitar a 4 imagens
    const newFiles = files.slice(0, 4 - selectedImages.length);
    setSelectedImages(prev => [...prev, ...newFiles]);

    // Criar previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!user) {
      setError('Você precisa estar logado para criar um post');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload de imagens primeiro
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        const uploadPromises = selectedImages.map(file => 
          storageService.uploadPostImage(file, user.id)
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults
          .map(result => result.data)
          .filter((url): url is string => url !== null);
      }

      const postData: any = {
        content: content.trim(),
        post_type: getPostType(selectedTag),
        tags: selectedTag ? [selectedTag] : [],
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      if (videoUrl.trim()) {
        postData.video_url = videoUrl.trim();
      }

      const { data, error: postError } = await postsService.create(postData);

      if (postError) {
        setError(postError.message || 'Erro ao criar post');
      } else {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setContent('');
        setSelectedImages([]);
        setImagePreviews([]);
        setVideoUrl('');
        setSelectedTag('');
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {groupId ? 'Postar no Grupo' : 'Criar Nova Publicação'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}
          
          <textarea
            className="w-full h-32 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm placeholder-gray-400"
            placeholder="O que você quer compartilhar com a comunidade hoje?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          ></textarea>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Video Input */}
          {showVideoInput && (
             <div className="mt-3">
                 <input 
                    type="text" 
                    placeholder="Cole o link do YouTube aqui..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-500 outline-none"
                 />
             </div>
          )}

          {/* Tags */}
          <div className="mt-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selectedTag === tag
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg transition-colors ${selectedImages.length > 0 ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-500'}`}
                disabled={selectedImages.length >= 4}
            >
              <ImageIcon size={20} />
            </button>
             <button 
                onClick={() => setShowVideoInput(!showVideoInput)}
                className={`p-2 rounded-lg transition-colors ${showVideoInput ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 text-gray-500'}`}
            >
              <Video size={20} />
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || loading || uploadingImages}
            className={`flex items-center px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              content.trim() && !loading && !uploadingImages
                ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {uploadingImages ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Enviando imagens...
              </>
            ) : loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Publicando...
              </>
            ) : (
              <>
                Publicar <Send size={16} className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
