
import React, { useState, useRef } from 'react';
import { X, Camera, AlertCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { storageService } from '../lib/supabase/storage';
import { useAuth } from '../contexts/AuthContext';

interface CreateServiceRequestModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateServiceRequestModal: React.FC<CreateServiceRequestModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!title.trim() || !description.trim() || !user) {
      setError('Preencha título e descrição');
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

      // Parse budget range (ex: "50€ - 100€" ou "50-100")
      let budgetMin: number | undefined;
      let budgetMax: number | undefined;
      if (budget.trim()) {
        const budgetMatch = budget.match(/(\d+)/g);
        if (budgetMatch && budgetMatch.length >= 1) {
          budgetMin = parseFloat(budgetMatch[0]);
          if (budgetMatch.length >= 2) {
            budgetMax = parseFloat(budgetMatch[1]);
          }
        }
      }

      const { data, error: requestError } = await servicesService.createRequest({
        title: title.trim(),
        description: description.trim(),
        budget_min: budgetMin,
        budget_max: budgetMax,
        currency: 'EUR',
        urgency,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      if (requestError) {
        setError(requestError.message || 'Erro ao criar pedido');
      } else {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setBudget('');
        setUrgency('medium');
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
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-900">Pedir Orçamento (Leilão)</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start space-x-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                    Descreva bem o seu problema. Vários prestadores receberão seu pedido e enviarão propostas competitivas.
                </p>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título do Pedido</label>
                <input
                type="text"
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm font-semibold"
                placeholder="Ex: Preciso de encanador urgente"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição Detalhada</label>
                <textarea
                className="w-full h-24 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm placeholder-gray-400"
                placeholder="Explique o que aconteceu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Orçamento Estimado</label>
                    <input
                    type="text"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                    placeholder="Ex: 50€ - 100€"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Urgência</label>
                    <select 
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as any)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm appearance-none"
                    >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta (Hoje)</option>
                    </select>
                </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fotos/Vídeos do Problema</label>
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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:bg-brand-50 transition-colors"
                    >
                      <Camera size={20} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-brand-400 hover:bg-brand-50 transition-colors"
                >
                  <Camera size={24} className="mb-2" />
                  <span className="text-xs font-medium">Adicionar Mídia</span>
                </button>
              )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 font-medium text-sm mr-2 hover:text-gray-800">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || loading}
            className={`px-6 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Criando...
              </>
            ) : (
              <>
                Lançar Pedido <Clock size={16} className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServiceRequestModal;
