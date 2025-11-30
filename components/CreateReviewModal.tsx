<<<<<<< HEAD
import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { reviewsService } from '../lib/supabase/reviews';
import { useAuth } from '../contexts/AuthContext';

interface CreateReviewModalProps {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  serviceId,
  serviceTitle,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [serviceCompleted, setServiceCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor, escreva um comentário');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: reviewError } = await reviewsService.createReview(serviceId, {
        rating,
        comment: comment.trim(),
        serviceCompleted,
      });

      if (reviewError) {
        setError(reviewError.message || 'Erro ao criar avaliação');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Avaliar Serviço</h2>
            <p className="text-xs text-gray-500 mt-1">{serviceTitle}</p>
          </div>
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1 && 'Péssimo'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none resize-none"
              placeholder="Compartilhe sua experiência com este serviço..."
            />
          </div>

          {/* Service Completed */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="serviceCompleted"
              checked={serviceCompleted}
              onChange={(e) => setServiceCompleted(e.target.checked)}
              className="w-4 h-4 text-miggro-teal border-gray-300 rounded focus:ring-miggro-teal"
            />
            <label htmlFor="serviceCompleted" className="text-sm text-gray-700">
              Confirmei que o serviço foi concluído
            </label>
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
            disabled={rating === 0 || !comment.trim() || loading}
            className={`px-6 py-2 bg-miggro-teal text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              !loading ? 'hover:bg-teal-700' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Enviando...
              </>
            ) : (
              'Enviar Avaliação'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;
=======
import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { reviewsService } from '../lib/supabase/reviews';
import { useAuth } from '../contexts/AuthContext';

interface CreateReviewModalProps {
  serviceId: string;
  serviceTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  serviceId,
  serviceTitle,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [serviceCompleted, setServiceCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação');
      return;
    }

    if (!comment.trim()) {
      setError('Por favor, escreva um comentário');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: reviewError } = await reviewsService.createReview(serviceId, {
        rating,
        comment: comment.trim(),
        serviceCompleted,
      });

      if (reviewError) {
        setError(reviewError.message || 'Erro ao criar avaliação');
      } else {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Avaliar Serviço</h2>
            <p className="text-xs text-gray-500 mt-1">{serviceTitle}</p>
          </div>
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1 && 'Péssimo'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none resize-none"
              placeholder="Compartilhe sua experiência com este serviço..."
            />
          </div>

          {/* Service Completed */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="serviceCompleted"
              checked={serviceCompleted}
              onChange={(e) => setServiceCompleted(e.target.checked)}
              className="w-4 h-4 text-miggro-teal border-gray-300 rounded focus:ring-miggro-teal"
            />
            <label htmlFor="serviceCompleted" className="text-sm text-gray-700">
              Confirmei que o serviço foi concluído
            </label>
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
            disabled={rating === 0 || !comment.trim() || loading}
            className={`px-6 py-2 bg-miggro-teal text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              !loading ? 'hover:bg-teal-700' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Enviando...
              </>
            ) : (
              'Enviar Avaliação'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
