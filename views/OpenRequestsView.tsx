<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Loader2, Plus, MessageCircle } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { useAuth } from '../contexts/AuthContext';
import CreateProposalModal from '../components/CreateProposalModal';

interface OpenRequestsViewProps {
  onBack: () => void;
  onChat?: () => void;
}

const OpenRequestsView: React.FC<OpenRequestsViewProps> = ({ onBack, onChat }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestForProposal, setSelectedRequestForProposal] = useState<string | null>(null);

  useEffect(() => {
    loadOpenRequests();
  }, []);

  const loadOpenRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await servicesService.listRequests({ 
        status: 'open',
        limit: 50 
      });
      if (error) {
        console.error('Erro ao carregar pedidos abertos:', error);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-gray-200 flex items-center space-x-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pedidos Abertos</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-miggro-teal" size={32} />
          <span className="ml-3 text-gray-600">Carregando pedidos...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum pedido aberto no momento.</p>
        </div>
      ) : (
        <div className="px-4 pb-24 space-y-4 pt-4">
          {requests.map((request: any) => {
            const author = request.author || {};
            const urgencyColor = request.urgency === 'high' ? 'text-red-600' : 
                                request.urgency === 'medium' ? 'text-yellow-600' : 'text-gray-500';
            
            return (
              <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{request.title}</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {request.created_at ? new Date(request.created_at).toLocaleDateString('pt-BR') : 'Agora'}
                      </span>
                      <span className={urgencyColor}>
                        {request.urgency === 'high' ? 'Urgente' : 
                         request.urgency === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {request.proposals_count > 0 && (
                        <span className="text-blue-600">
                          {request.proposals_count} proposta(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>

                {(request.budget_min || request.budget_max) && (
                  <div className="text-xs text-gray-500 mb-3">
                    Orçamento: {request.budget_min ? `€${request.budget_min}` : ''}
                    {request.budget_max ? ` - €${request.budget_max}` : '+'}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!user) {
                      alert('Você precisa estar logado para enviar propostas');
                      return;
                    }
                    setSelectedRequestForProposal(request.id);
                  }}
                  className="w-full bg-miggro-teal text-white py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Enviar Proposta
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Proposal Modal */}
      {selectedRequestForProposal && (
        <CreateProposalModal
          requestId={selectedRequestForProposal}
          requestTitle={requests.find((r: any) => r.id === selectedRequestForProposal)?.title || ''}
          onClose={() => setSelectedRequestForProposal(null)}
          onSuccess={() => {
            setSelectedRequestForProposal(null);
            loadOpenRequests();
          }}
        />
      )}
    </div>
  );
};

export default OpenRequestsView;
=======
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Loader2, Plus, MessageCircle } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { useAuth } from '../contexts/AuthContext';
import CreateProposalModal from '../components/CreateProposalModal';

interface OpenRequestsViewProps {
  onBack: () => void;
  onChat?: () => void;
}

const OpenRequestsView: React.FC<OpenRequestsViewProps> = ({ onBack, onChat }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestForProposal, setSelectedRequestForProposal] = useState<string | null>(null);

  useEffect(() => {
    loadOpenRequests();
  }, []);

  const loadOpenRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await servicesService.listRequests({ 
        status: 'open',
        limit: 50 
      });
      if (error) {
        console.error('Erro ao carregar pedidos abertos:', error);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-gray-200 flex items-center space-x-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pedidos Abertos</h1>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-miggro-teal" size={32} />
          <span className="ml-3 text-gray-600">Carregando pedidos...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nenhum pedido aberto no momento.</p>
        </div>
      ) : (
        <div className="px-4 pb-24 space-y-4 pt-4">
          {requests.map((request: any) => {
            const author = request.author || {};
            const urgencyColor = request.urgency === 'high' ? 'text-red-600' : 
                                request.urgency === 'medium' ? 'text-yellow-600' : 'text-gray-500';
            
            return (
              <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{request.title}</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {request.created_at ? new Date(request.created_at).toLocaleDateString('pt-BR') : 'Agora'}
                      </span>
                      <span className={urgencyColor}>
                        {request.urgency === 'high' ? 'Urgente' : 
                         request.urgency === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                      {request.proposals_count > 0 && (
                        <span className="text-blue-600">
                          {request.proposals_count} proposta(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>

                {(request.budget_min || request.budget_max) && (
                  <div className="text-xs text-gray-500 mb-3">
                    Orçamento: {request.budget_min ? `€${request.budget_min}` : ''}
                    {request.budget_max ? ` - €${request.budget_max}` : '+'}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (!user) {
                      alert('Você precisa estar logado para enviar propostas');
                      return;
                    }
                    setSelectedRequestForProposal(request.id);
                  }}
                  className="w-full bg-miggro-teal text-white py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Enviar Proposta
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Proposal Modal */}
      {selectedRequestForProposal && (
        <CreateProposalModal
          requestId={selectedRequestForProposal}
          requestTitle={requests.find((r: any) => r.id === selectedRequestForProposal)?.title || ''}
          onClose={() => setSelectedRequestForProposal(null)}
          onSuccess={() => {
            setSelectedRequestForProposal(null);
            loadOpenRequests();
          }}
        />
      )}
    </div>
  );
};

export default OpenRequestsView;
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
