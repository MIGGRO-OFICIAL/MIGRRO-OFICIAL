
import React, { useState, useEffect } from 'react';
import { SERVICE_REQUESTS } from '../services/mockData';
import { ChevronLeft, Clock, MapPin, MessageCircle, Lock, Unlock, CheckCircle, Loader2 } from 'lucide-react';
import UnlockContactModal from '../components/UnlockContactModal';
import { servicesService } from '../lib/supabase/services';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../lib/supabase/chat';

interface MyRequestsViewProps {
  onBack: () => void;
  onChat?: () => void;
}

const MyRequestsView: React.FC<MyRequestsViewProps> = ({ onBack, onChat }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedProposals, setUnlockedProposals] = useState<string[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      loadProposals(selectedRequest.id);
    }
  }, [selectedRequest]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Buscar pedidos do usuário atual
      const { data, error } = await servicesService.listRequests({ 
        limit: 20 
      });
      if (error) {
        console.error('Erro ao carregar pedidos:', error);
        setRequests(SERVICE_REQUESTS as any);
      } else {
        setRequests(data || []);
        if (data && data.length > 0) {
          setSelectedRequest(data[0]);
        } else if (SERVICE_REQUESTS.length > 0) {
          setSelectedRequest(SERVICE_REQUESTS[0] as any);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
      setRequests(SERVICE_REQUESTS as any);
      if (SERVICE_REQUESTS.length > 0) {
        setSelectedRequest(SERVICE_REQUESTS[0] as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async (requestId: string) => {
    setLoadingProposals(true);
    try {
      const { data, error } = await servicesService.listProposals(requestId);
      if (error) {
        console.error('Erro ao carregar propostas:', error);
      } else {
        setProposals(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  const handleUnlock = (propId: string) => {
    setUnlockedProposals([...unlockedProposals, propId]);
    setShowUnlockModal(false);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!confirm('Tem certeza que deseja aceitar esta proposta?')) return;

    try {
      const { error } = await servicesService.acceptProposal(proposalId);
      if (error) {
        alert('Erro ao aceitar proposta: ' + error.message);
      } else {
        alert('Proposta aceita! Você pode conversar com o prestador agora.');
        if (selectedRequest) {
          await loadProposals(selectedRequest.id);
          await loadRequests();
        }
        if (onChat) onChat();
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar esta proposta?')) return;

    try {
      const { error } = await servicesService.rejectProposal(proposalId);
      if (error) {
        alert('Erro ao rejeitar proposta: ' + error.message);
      } else {
        if (selectedRequest) {
          await loadProposals(selectedRequest.id);
        }
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleChatWithProvider = async (providerId: string) => {
    try {
      const { data: conversation, error } = await chatService.getOrCreateConversation(providerId);
      if (error) {
        alert('Erro ao iniciar conversa: ' + error.message);
      } else {
        if (onChat) onChat();
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Meus Pedidos</h1>
        </div>
        {requests.length > 0 && (
          <div className="text-xs text-gray-500">
            {requests.filter((r: any) => r.status === 'open').length} aberto(s)
          </div>
        )}
      </header>

      {/* Requests List (if multiple) */}
      {requests.length > 1 && (
        <div className="px-4 py-2 bg-white border-b border-gray-100 overflow-x-auto">
          <div className="flex space-x-2">
            {requests.map((req: any) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedRequest?.id === req.id
                    ? 'bg-miggro-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {req.title.length > 20 ? req.title.substring(0, 20) + '...' : req.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-miggro-teal" size={32} />
          <span className="ml-3 text-gray-600">Carregando pedidos...</span>
        </div>
      ) : !selectedRequest ? (
        <div className="text-center py-12 text-gray-500">
          <p>Você ainda não criou nenhum pedido.</p>
        </div>
      ) : (
        <>
          {/* Request Details */}
          <div className="p-4 bg-white mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-900">{selectedRequest.title}</h2>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    selectedRequest.status === 'open' ? 'bg-green-100 text-green-700' :
                    selectedRequest.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                }`}>
                    {selectedRequest.status === 'open' ? 'Aberto' :
                     selectedRequest.status === 'in_progress' ? 'Em Andamento' :
                     'Fechado'}
                </span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                 <span className="flex items-center">
                   <Clock size={12} className="mr-1" /> 
                   {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleDateString('pt-BR') : 'Agora'}
                 </span>
                 <span className={`flex items-center font-medium ${
                   selectedRequest.urgency === 'high' ? 'text-red-500' : 'text-gray-500'
                 }`}>
                   {selectedRequest.urgency === 'high' ? 'Urgente' : 
                    selectedRequest.urgency === 'medium' ? 'Média' : 'Baixa'}
                 </span>
                 {(selectedRequest.budget_min || selectedRequest.budget_max) && (
                   <span>
                     Orçamento: {selectedRequest.budget_min ? `€${selectedRequest.budget_min}` : ''}
                     {selectedRequest.budget_max ? ` - €${selectedRequest.budget_max}` : '+'}
                   </span>
                 )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {selectedRequest.description}
            </p>
          </div>

          {/* Proposals List */}
          <div className="px-4 pb-24">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                Propostas Recebidas 
                <span className="ml-2 bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">
                  {loadingProposals ? '...' : proposals.length}
                </span>
            </h3>

            {loadingProposals ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-miggro-teal mr-2" size={20} />
                <span className="text-gray-600 text-sm">Carregando propostas...</span>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Nenhuma proposta ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((prop: any) => {
                  const provider = prop.provider || {};
                  const isUnlocked = provider.is_premium || unlockedProposals.includes(prop.id);
                  const isAccepted = prop.status === 'accepted';
                  const isRejected = prop.status === 'rejected';

                return (
                    <div key={prop.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                        {!isUnlocked && (
                            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                                <Lock className="text-gray-400 mb-2" size={24} />
                                <p className="text-sm font-bold text-gray-800 mb-1">Proposta Oculta</p>
                                <p className="text-xs text-gray-500 mb-3">Este prestador não é Premium.</p>
                                <button 
                                    onClick={() => setShowUnlockModal(true)}
                                    className="bg-brand-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-brand-700 transition-colors"
                                >
                                    Desbloquear Contato
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={provider.avatar_url || prop.providerAvatar || 'https://via.placeholder.com/40'} 
                                className="w-10 h-10 rounded-full border border-gray-200" 
                                alt={provider.name || prop.providerName}
                              />
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm">{provider.name || prop.providerName}</h4>
                                <div className="flex items-center text-xs text-gray-500">
                                  {provider.verification_status === 'verified' && (
                                    <CheckCircle size={10} className="text-blue-500 mr-1" />
                                  )}
                                  {provider.verification_status === 'verified' ? 'Verificado' : 'Não verificado'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block font-bold text-lg text-brand-600">
                                {prop.currency === 'RAIZ' ? 'MG' : '€'} {prop.price}
                              </span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{prop.description}</p>

                        {isAccepted ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <p className="text-green-700 font-semibold text-sm">✓ Proposta Aceita</p>
                              <button
                                onClick={() => handleChatWithProvider(provider.id)}
                                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700"
                              >
                                <MessageCircle size={14} className="inline mr-2" />
                                Conversar com Prestador
                              </button>
                            </div>
                          ) : isRejected ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                              <p className="text-gray-600 text-sm">Proposta Rejeitada</p>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleRejectProposal(prop.id)}
                                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg font-medium text-xs hover:bg-gray-50"
                              >
                                Recusar
                              </button>
                              <button 
                                onClick={() => handleAcceptProposal(prop.id)}
                                className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-brand-700 shadow-sm flex items-center justify-center"
                              >
                                <MessageCircle size={14} className="mr-2" /> Aceitar {'&'} Conversar
                              </button>
                            </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {showUnlockModal && (
          <UnlockContactModal 
            price={2.99}
            onClose={() => setShowUnlockModal(false)}
            onUnlock={() => handleUnlock('temp_id')}
          />
      )}
    </div>
  );
};

export default MyRequestsView;
