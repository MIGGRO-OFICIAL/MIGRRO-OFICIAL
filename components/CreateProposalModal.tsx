<<<<<<< HEAD
import React, { useState } from 'react';
import { X, DollarSign, FileText, Loader2 } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { useAuth } from '../contexts/AuthContext';

interface CreateProposalModalProps {
  requestId: string;
  requestTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateProposalModal: React.FC<CreateProposalModalProps> = ({ requestId, requestTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'RAIZ'>('EUR');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !description.trim() || !user) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: proposalError } = await servicesService.createProposal(requestId, {
        price: parseFloat(price),
        currency,
        description: description.trim(),
      });

      if (proposalError) {
        setError(proposalError.message || 'Erro ao criar proposta');
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
            <h2 className="font-bold text-gray-900">Enviar Proposta</h2>
            <p className="text-xs text-gray-500 mt-1">{requestTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

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
              Descrição da Proposta *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none resize-none"
              placeholder="Descreva como você vai resolver o problema, tempo estimado, experiência relevante..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 Dica:</p>
            <p>Seja específico sobre como você vai ajudar. Isso aumenta suas chances de ser escolhido!</p>
          </div>
        </form>

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
            disabled={!price || !description.trim() || loading}
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
              'Enviar Proposta'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProposalModal;
=======
import React, { useState } from 'react';
import { X, DollarSign, FileText, Loader2 } from 'lucide-react';
import { servicesService } from '../lib/supabase/services';
import { useAuth } from '../contexts/AuthContext';

interface CreateProposalModalProps {
  requestId: string;
  requestTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateProposalModal: React.FC<CreateProposalModalProps> = ({ requestId, requestTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'RAIZ'>('EUR');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !description.trim() || !user) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: proposalError } = await servicesService.createProposal(requestId, {
        price: parseFloat(price),
        currency,
        description: description.trim(),
      });

      if (proposalError) {
        setError(proposalError.message || 'Erro ao criar proposta');
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
            <h2 className="font-bold text-gray-900">Enviar Proposta</h2>
            <p className="text-xs text-gray-500 mt-1">{requestTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

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
              Descrição da Proposta *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:outline-none resize-none"
              placeholder="Descreva como você vai resolver o problema, tempo estimado, experiência relevante..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 Dica:</p>
            <p>Seja específico sobre como você vai ajudar. Isso aumenta suas chances de ser escolhido!</p>
          </div>
        </form>

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
            disabled={!price || !description.trim() || loading}
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
              'Enviar Proposta'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProposalModal;
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
