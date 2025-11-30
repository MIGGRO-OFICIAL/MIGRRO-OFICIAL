
import React, { useState } from 'react';
import { X, Image as ImageIcon, Video, Send } from 'lucide-react';
import { Post } from '../types';

interface CreatePostModalProps {
  onClose: () => void;
  // In a real app, this would also take an 'onSubmit' prop
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [hasImage, setHasImage] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);

  const tags = ['Geral', 'Ajuda', 'Evento', 'Dica', 'Denúncia'];

  const handleSubmit = () => {
    // Logic to create post would go here
    console.log({ content, selectedTag, hasImage, videoUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Criar Nova Publicação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            className="w-full h-32 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm placeholder-gray-400"
            placeholder="O que você quer compartilhar com a comunidade hoje?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

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
            <button 
                onClick={() => setHasImage(!hasImage)}
                className={`p-2 rounded-lg transition-colors ${hasImage ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200 text-gray-500'}`}
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
            disabled={!content.trim()}
            className={`flex items-center px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              content.trim()
                ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Publicar <Send size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
