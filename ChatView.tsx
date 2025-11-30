
import React, { useState } from 'react';
import { MOCK_CHATS, CURRENT_USER } from '../services/mockData';
import { ChevronLeft, Search, Phone, Video, MoreVertical, Send, Image, Mic } from 'lucide-react';
import { ChatConversation, DirectMessage } from '../types';

interface ChatViewProps {
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onBack }) => {
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [inputText, setInputText] = useState('');
  
  // Mock messages for the active chat
  const [messages, setMessages] = useState<DirectMessage[]>([
    { id: 'm1', senderId: 'p4', text: 'Olá! Vi que você se interessou pela consultoria.', timestamp: new Date(Date.now() - 86400000), isMe: false },
    { id: 'm2', senderId: 'u1', text: 'Sim, gostaria de saber mais sobre o Arraigo.', timestamp: new Date(Date.now() - 80000000), isMe: true },
    { id: 'm3', senderId: 'p4', text: 'Claro! Você já tem o tempo de residência necessário?', timestamp: new Date(Date.now() - 7000000), isMe: false },
  ]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: DirectMessage = {
        id: Date.now().toString(),
        senderId: CURRENT_USER.id,
        text: inputText,
        timestamp: new Date(),
        isMe: true
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  // RENDER: INBOX LIST
  if (!activeChat) {
    return (
        <div className="h-full bg-white flex flex-col max-w-md mx-auto">
            <header className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
                <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Mensagens</h1>
            </header>

            <div className="p-4">
                <div className="relative mb-4">
                    <input 
                        type="text" 
                        placeholder="Buscar conversas..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-brand-500 text-sm"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>

                <div className="space-y-1">
                    {MOCK_CHATS.map(chat => (
                        <div 
                            key={chat.id} 
                            onClick={() => setActiveChat(chat)}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                        >
                            <div className="relative">
                                <img src={chat.participantAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                                {chat.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                                        {chat.unreadCount}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900 truncate">{chat.participantName}</h3>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                                </div>
                                <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                                    {chat.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  // RENDER: ACTIVE CHAT ROOM
  return (
    <div className="h-full bg-[#f0f2f5] flex flex-col max-w-md mx-auto">
        <header className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center space-x-3">
                <button onClick={() => setActiveChat(null)} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                    <img src={activeChat.participantAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{activeChat.participantName}</h3>
                        <p className="text-[10px] text-green-600 font-medium">Online agora</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-3 text-brand-600">
                <Phone size={20} />
                <Video size={20} />
                <MoreVertical size={20} className="text-gray-400" />
            </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center my-4">
                <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full">Hoje</span>
            </div>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                        msg.isMe 
                            ? 'bg-brand-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-900 rounded-tl-none'
                    }`}>
                        {msg.text}
                        <div className={`text-[9px] text-right mt-1 ${msg.isMe ? 'text-brand-200' : 'text-gray-400'}`}>
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Input Area */}
        <div className="bg-white p-3 border-t border-gray-200 flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                <Image size={20} />
            </button>
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite uma mensagem..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
                />
            </div>
            {inputText ? (
                <button onClick={handleSendMessage} className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors">
                    <Send size={18} />
                </button>
            ) : (
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                    <Mic size={20} />
                </button>
            )}
        </div>
    </div>
  );
};

export default ChatView;
