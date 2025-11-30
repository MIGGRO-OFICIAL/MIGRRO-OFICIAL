
import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, ChevronLeft, ScanFace, CreditCard } from 'lucide-react';
import { User, VerificationStep } from '../types';

interface VerificationFlowProps {
  user: User;
  onComplete: () => void;
  onBack: () => void;
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({ user, onComplete, onBack }) => {
  const [step, setStep] = useState<'intro' | 'document' | 'face' | 'success'>('intro');

  const pendingSteps = user.verificationSteps.filter(s => s.status !== 'verified');

  const handleDocumentUpload = () => {
    // Simulate upload delay
    setTimeout(() => {
        setStep('face');
    }, 1500);
  };

  const handleFaceScan = () => {
     // Simulate scan delay
     setTimeout(() => {
        setStep('success');
    }, 2000);
  };

  if (step === 'intro') {
    return (
        <div className="h-full bg-white p-6 flex flex-col max-w-md mx-auto">
            <button onClick={onBack} className="mb-6 text-gray-500 hover:text-gray-800 self-start">
                <ChevronLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Vamos verificar seu perfil?</h1>
                <p className="text-gray-500 leading-relaxed">
                    A segurança é nossa prioridade. Para ganhar o selo de <span className="font-bold text-brand-600">Alta Confiança</span>, precisamos confirmar que você é você.
                </p>

                <div className="w-full bg-gray-50 p-4 rounded-xl text-left space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                        <CreditCard size={18} className="mr-3 text-gray-400" />
                        <span>Foto do Documento (RG, Passaporte ou TIE)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                        <ScanFace size={18} className="mr-3 text-gray-400" />
                        <span>Selfie de validação (Liveness)</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setStep('document')}
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all"
            >
                Começar Verificação
            </button>
        </div>
    );
  }

  if (step === 'document') {
      return (
        <div className="h-full bg-gray-900 p-6 flex flex-col items-center justify-center max-w-md mx-auto text-white">
            <h2 className="text-xl font-bold mb-2">Foto do Documento</h2>
            <p className="text-gray-400 text-sm mb-8 text-center">Posicione seu documento dentro da moldura. Evite reflexos.</p>
            
            <div className="w-full aspect-[1.58] border-2 border-dashed border-white/50 rounded-xl mb-8 flex items-center justify-center bg-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan"></div>
                <Upload size={32} className="text-white/50" />
            </div>

            <button 
                onClick={handleDocumentUpload}
                className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center"
            >
                <Camera size={18} className="mr-2" />
                Tirar Foto
            </button>
        </div>
      );
  }

  if (step === 'face') {
    return (
      <div className="h-full bg-gray-900 p-6 flex flex-col items-center justify-center max-w-md mx-auto text-white">
          <h2 className="text-xl font-bold mb-2">Selfie de Segurança</h2>
          <p className="text-gray-400 text-sm mb-8 text-center">Aproxime seu rosto. Vamos verificar se é uma pessoa real.</p>
          
          <div className="w-48 h-48 rounded-full border-4 border-brand-500 mb-8 overflow-hidden bg-gray-800 relative">
             <img src={user.avatar} className="w-full h-full object-cover opacity-50" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <ScanFace size={48} className="text-brand-500 animate-pulse" />
             </div>
          </div>

          <button 
              onClick={handleFaceScan}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-500 transition-all"
          >
              Estou Pronto
          </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-white p-6 flex flex-col items-center justify-center max-w-md mx-auto text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
            <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos em Análise!</h2>
        <p className="text-gray-500 mb-8">
            Nossa IA está verificando seus dados. Se tudo estiver certo, seu <span className="font-bold">Trust Score</span> subirá em alguns minutos.
        </p>
        <button 
            onClick={onComplete}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
        >
            Voltar ao Perfil
        </button>
    </div>
  );
};

export default VerificationFlow;
