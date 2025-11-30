
import React, { useState } from 'react';
import { SERVICE_REQUESTS } from '../services/mockData';
import { ChevronLeft, Clock, MapPin, MessageCircle, Lock, Unlock, CheckCircle } from 'lucide-react';
import UnlockContactModal from '../components/UnlockContactModal';

interface MyRequestsViewProps {
  onBack: () => void;
}

const MyRequestsView: React.FC<MyRequestsViewProps> = ({ onBack }) => {
  const [selectedRequest, setSelectedRequest] = useState(SERVICE_REQUESTS[0]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedProposals, setUnlockedProposals] = useState<string[]>(['prop2']);

  const handleUnlock = (propId: string) => {
    setUnlockedProposals([...unlockedProposals, propId]);
    setShowUnlockModal(false);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-gray-200 flex items-center space-x-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Meus Pedidos</h1>
      </header>

      {/* Request Details */}
      <div className="p-4 bg-white mb-4 shadow-sm">
        <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-900">{selectedRequest.title}</h2>
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                selectedRequest.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
                {selectedRequest.status === 'open' ? 'Aberto' : 'Fechado'}
            </span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
             <span className="flex items-center"><Clock size={12} className="mr-1" /> {selectedRequest.timestamp}</span>
             <span className="flex items-center text-red-500 font-medium">{selectedRequest.urgency === 'high' ? 'Urgente' : 'Normal'}</span>
             <span>Orçamento: {selectedRequest.budget}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
            {selectedRequest.description}
        </p>
      </div>

      {/* Proposals List */}
      <div className="px-4 pb-24">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            Propostas Recebidas 
            <span className="ml-2 bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">{selectedRequest.proposals.length}</span>
        </h3>

        <div className="space-y-4">
            {selectedRequest.proposals.map((prop) => {
                const isUnlocked = prop.isUnlocked || unlockedProposals.includes(prop.id);

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
                                <img src={prop.providerAvatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{prop.providerName}</h4>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <CheckCircle size={10} className="text-blue-500 mr-1" /> Verificado
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-lg text-brand-600">€ {prop.price}</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{prop.description}</p>

                        <div className="flex space-x-2">
                             <button className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg font-medium text-xs hover:bg-gray-50">
                                Recusar
                            </button>
                            <button className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-brand-700 shadow-sm flex items-center justify-center">
                                <MessageCircle size={14} className="mr-2" /> Aceitar & Conversar
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

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
