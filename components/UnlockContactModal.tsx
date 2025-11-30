
import React from 'react';
import { Lock, CreditCard, Leaf, ShieldCheck, X } from 'lucide-react';

interface UnlockContactModalProps {
  onClose: () => void;
  onUnlock: () => void;
  price: number;
}

const UnlockContactModal: React.FC<UnlockContactModalProps> = ({ onClose, onUnlock, price }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
        </button>

        <div className="bg-gray-900 p-6 text-white">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Lock size={32} className="text-brand-400" />
            </div>
            <h2 className="text-xl font-bold">Contato Bloqueado</h2>
            <p className="text-gray-400 text-sm mt-2">
                Para sua segurança, contatos externos são ocultados até que a proposta seja aceita.
            </p>
        </div>

        <div className="p-6 space-y-4">
            <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg flex items-start text-left">
                <ShieldCheck size={18} className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-yellow-800">
                    Ao liberar o contato, a Miggro retém o pagamento até o serviço ser concluído (Escrow).
                </p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onUnlock}
                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-brand-700 transition-all flex items-center justify-center"
                >
                    <Leaf size={18} className="mr-2" />
                    Usar 50 MiggroCoins
                </button>
                
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OU</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <button 
                    onClick={onUnlock}
                    className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center"
                >
                    <CreditCard size={18} className="mr-2" />
                    Pagar Taxa de € 2.99
                </button>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-4">
                Membros Premium não pagam taxas de desbloqueio.
            </p>
        </div>
      </div>
    </div>
  );
};

export default UnlockContactModal;
