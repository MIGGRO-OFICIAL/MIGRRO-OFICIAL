import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, MessageCircle, Loader2, MapPin, Calendar, CheckCircle, Plus } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { chatService } from '../lib/supabase/chat';
import { reviewsService } from '../lib/supabase/reviews';
import { analyticsService } from '../lib/supabase/analytics';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';
import CreateReviewModal from '../components/CreateReviewModal';

interface ServiceDetailViewProps {
  serviceId: string;
  onBack: () => void;
  onChat?: () => void;
}

const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({ serviceId, onBack, onChat }) => {
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    loadService();
    loadReviews();
  }, [serviceId]);

  useEffect(() => {
    if (service && user) {
      checkIfReviewed();
    }
  }, [service, user]);

  const loadService = async () => {
    setLoading(true);
    try {
      const { data, error: serviceError } = await servicesService.getServiceById(serviceId);
      if (serviceError) {
        setError(serviceError.message || 'Erro ao carregar serviço');
      } else {
        setService(data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await reviewsService.listServiceReviews(serviceId, 10);
      if (!error && data) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Erro ao carregar reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkIfReviewed = async () => {
    if (!user || !service) return;
    try {
      const { data } = await reviewsService.listServiceReviews(serviceId, 100);
      if (data) {
        const userReview = data.find((r: any) => r.reviewer_id === user.id);
        setHasReviewed(!!userReview);
      }
    } catch (err) {
      console.error('Erro ao verificar review:', err);
    }
  };

  const handleContact = async () => {
    if (!service || !user) return;

    try {
      // Registrar clique
      await analyticsService.trackServiceClick(serviceId);

      // Criar ou obter conversa
      const { data: conversation, error: convError } = await chatService.getOrCreateConversation(service.provider.id);
      if (convError) {
        alert('Erro ao iniciar conversa: ' + convError.message);
        return;
      }

      // Enviar mensagem inicial
      await chatService.sendMessage(conversation.id, `Olá! Tenho interesse no serviço "${service.title}"`);

      if (onChat) {
        onChat();
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-miggro-teal mx-auto mb-4" size={32} />
          <p className="text-gray-600">Carregando serviço...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Serviço não encontrado'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-miggro-teal text-white rounded-lg hover:bg-teal-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const provider = service.provider || {};
  const category = service.category || {};
  const price = service.price || 0;
  const currency = service.currency || 'EUR';
  const rating = service.average_rating || service.rating || 0;
  const reviewsCount = service.total_reviews || service.reviews_count || 0;
  const isVerified = provider.verification_status === 'verified' || service.is_verified || false;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Detalhes do Serviço</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Images */}
        {service.image_urls && service.image_urls.length > 0 && (
          <div className="bg-white mb-4">
            <div className="grid grid-cols-2 gap-1">
              {service.image_urls.slice(0, 4).map((url: string, index: number) => (
                <img 
                  key={index}
                  src={url} 
                  alt={`Serviço ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Service Info */}
        <div className="bg-white p-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h2>
          <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{service.description}</p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-2xl font-bold text-miggro-teal">
                  {currency === 'RAIZ' ? (
                    <>MG {price}</>
                  ) : (
                    <>€ {price.toFixed(2)}</>
                  )}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {category.name_pt || category.name || 'Geral'}
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-500">{reviewsCount} avaliações</span>
            </div>
          </div>
        </div>

        {/* Provider Info */}
        <div className="bg-white p-4 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Prestador</h3>
          <div className="flex items-center space-x-3">
            <img 
              src={provider.avatar_url || 'https://via.placeholder.com/60'} 
              alt={provider.name}
              className="w-14 h-14 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-gray-900">{provider.name}</h4>
                {isVerified && <ShieldCheck size={16} className="text-blue-500" />}
              </div>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>Trust Score: {provider.trust_score || 0}/100</span>
                {provider.location && (
                  <span className="flex items-center">
                    <MapPin size={12} className="mr-1" />
                    {provider.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Avaliações ({reviews.length})
            </h3>
            {user && user.id !== provider.id && !hasReviewed && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs text-miggro-teal hover:underline flex items-center"
              >
                <Plus size={14} className="mr-1" />
                Avaliar
              </button>
            )}
          </div>

          {loadingReviews ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="animate-spin text-miggro-teal" size={20} />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Ainda não há avaliações para este serviço.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => {
                const reviewer = review.reviewer || {};
                return (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start space-x-3">
                      <img
                        src={reviewer.avatar_url || 'https://via.placeholder.com/40'}
                        alt={reviewer.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {reviewer.name || 'Usuário'}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-4 space-y-2">
          <button
            onClick={handleContact}
            className="w-full bg-miggro-teal text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            <MessageCircle size={20} className="mr-2" />
            Entrar em Contato
          </button>
          <button
            className="w-full border-2 border-miggro-teal text-miggro-teal py-3 rounded-lg font-bold hover:bg-miggro-teal/5 transition-colors"
          >
            Solicitar Orçamento
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && service && (
        <CreateReviewModal
          serviceId={serviceId}
          serviceTitle={service.title}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => {
            setIsReviewModalOpen(false);
            loadReviews();
            loadService(); // Atualizar rating
            checkIfReviewed();
          }}
        />
      )}
    </div>
  );
};

export default ServiceDetailView;
