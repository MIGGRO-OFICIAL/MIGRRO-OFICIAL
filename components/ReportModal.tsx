// Modal para Denunciar Conteúdo
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { moderationService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'post' | 'service' | 'user' | 'comment' | 'group' | 'message';
  reportedId: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam ou conteúdo enganoso' },
  { value: 'harassment', label: 'Assédio ou bullying' },
  { value: 'fake', label: 'Perfil ou conteúdo falso' },
  { value: 'inappropriate', label: 'Conteúdo inadequado' },
  { value: 'violence', label: 'Violência ou discurso de ódio' },
  { value: 'other', label: 'Outro' },
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportType,
  reportedId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !reason) {
      setError('Por favor, selecione um motivo');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: reportError } = await moderationService.createReport(user.id, {
        report_type: reportType,
        reported_id: reportedId,
        reason,
        description: description.trim() || undefined,
      });

      if (reportError) {
        setError('Erro ao enviar denúncia. Tente novamente.');
        console.error('Report error:', reportError);
      } else {
        // Sucesso
        setReason('');
        setDescription('');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Erro ao enviar denúncia. Tente novamente.');
      console.error('Report error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeLabel = () => {
    const labels: Record<string, string> = {
      post: 'post',
      service: 'serviço',
      user: 'perfil',
      comment: 'comentário',
      group: 'grupo',
      message: 'mensagem',
    };
    return labels[reportType] || 'conteúdo';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Denunciar {getReportTypeLabel()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Ajude-nos a manter a comunidade segura. Sua denúncia será revisada pela nossa equipe de
          moderação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da denúncia *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:border-transparent"
              required
            >
              <option value="">Selecione um motivo</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Forneça mais detalhes sobre o problema..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || !reason}
            >
              {submitting ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
<<<<<<< HEAD
=======
=======
// Modal para Denunciar Conteúdo
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { moderationService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'post' | 'service' | 'user' | 'comment' | 'group' | 'message';
  reportedId: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam ou conteúdo enganoso' },
  { value: 'harassment', label: 'Assédio ou bullying' },
  { value: 'fake', label: 'Perfil ou conteúdo falso' },
  { value: 'inappropriate', label: 'Conteúdo inadequado' },
  { value: 'violence', label: 'Violência ou discurso de ódio' },
  { value: 'other', label: 'Outro' },
];

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportType,
  reportedId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !reason) {
      setError('Por favor, selecione um motivo');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: reportError } = await moderationService.createReport(user.id, {
        report_type: reportType,
        reported_id: reportedId,
        reason,
        description: description.trim() || undefined,
      });

      if (reportError) {
        setError('Erro ao enviar denúncia. Tente novamente.');
        console.error('Report error:', reportError);
      } else {
        // Sucesso
        setReason('');
        setDescription('');
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Erro ao enviar denúncia. Tente novamente.');
      console.error('Report error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeLabel = () => {
    const labels: Record<string, string> = {
      post: 'post',
      service: 'serviço',
      user: 'perfil',
      comment: 'comentário',
      group: 'grupo',
      message: 'mensagem',
    };
    return labels[reportType] || 'conteúdo';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Denunciar {getReportTypeLabel()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Ajude-nos a manter a comunidade segura. Sua denúncia será revisada pela nossa equipe de
          moderação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da denúncia *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:border-transparent"
              required
            >
              <option value="">Selecione um motivo</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Forneça mais detalhes sobre o problema..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miggro-teal focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || !reason}
            >
              {submitting ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
>>>>>>> origin/main
>>>>>>> 75014090d373d530ee065de6bbe142b9dc93f0b2
