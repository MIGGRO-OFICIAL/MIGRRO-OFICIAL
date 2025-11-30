import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Image as ImageIcon, DollarSign, Tag } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { storageService } from '../lib/supabase/storage';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CreateServiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'RAIZ'>('EUR');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Erro ao carregar categorias:', error);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.slice(0, 5 - selectedImages.length);
    setSelectedImages(prev => [...prev, ...newFiles]);

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
    if (!title.trim() || !description.trim() || !price || !categoryId || !user) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload de imagens
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(file => 
          storageService.uploadServiceImage(file, user.id)
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults
          .map(result => result.data)
          .filter((url): url is string => url !== null);
      }

      const { data, error: serviceError } = await servicesService.createService({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency,
        category_id: categoryId,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      if (serviceError) {
        setError(serviceError.message || 'Erro ao criar serviço');
      } else {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setCurrency('EUR');
        setCategoryId('');
        setSelectedImages([]);
        setImagePreviews([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Oferecer Serviço</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Serviço *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
              placeholder="Ex: Consultoria de Imigração"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none resize-none"
              placeholder="Descreva seu serviço em detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeda *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'EUR' | 'RAIZ')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
              >
                <option value="EUR">EUR (€)</option>
                <option value="RAIZ">RAIZ (MG)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            {loadingCategories ? (
              <div className="flex items-center py-2">
                <Loader2 className="animate-spin text-miggro-teal mr-2" size={16} />
                <span className="text-sm text-gray-500">Carregando categorias...</span>
              </div>
            ) : (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_pt || cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Serviço (até 5)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-400 hover:border-miggro-teal hover:bg-miggro-teal/5 transition-colors"
                  >
                    <ImageIcon size={20} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-miggro-teal hover:bg-miggro-teal/5 transition-colors"
              >
                <ImageIcon size={24} className="mb-2" />
                <span className="text-xs font-medium">Adicionar Imagens</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 font-medium text-sm hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || !price || !categoryId || loading}
            className={`px-6 py-2 bg-miggro-teal text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              !loading ? 'hover:bg-teal-700' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Criando...
              </>
            ) : (
              'Publicar Serviço'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceModal;
