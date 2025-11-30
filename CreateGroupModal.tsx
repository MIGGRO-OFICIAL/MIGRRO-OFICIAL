
import React, { useState } from 'react';
import { X, Users, Lock, Unlock } from 'lucide-react';

interface CreateGroupModalProps {
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = () => {
    // Logic to create group would go here
    console.log({ name, description, isPrivate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center">
            <Users size={20} className="mr-2 text-brand-600" />
            Criar Novo Grupo
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Grupo</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              placeholder="Ex: Brasileiros em Barcelona"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
            <textarea
              className="w-full h-24 p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm placeholder-gray-400"
              placeholder="Qual o objetivo desta comunidade?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                isPrivate ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
              <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${isPrivate ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                      {isPrivate ? <Lock size={20} /> : <Unlock size={20} />}
                  </div>
                  <div>
                      <h4 className="font-bold text-sm text-gray-900">{isPrivate ? 'Grupo Privado' : 'Grupo Público'}</h4>
                      <p className="text-xs text-gray-500">{isPrivate ? 'Apenas convidados podem ver.' : 'Qualquer um pode entrar.'}</p>
                  </div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isPrivate ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
              }`}>
                  {isPrivate && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 font-medium text-sm mr-2 hover:text-gray-800">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
              name.trim()
                ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Criar Comunidade
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
