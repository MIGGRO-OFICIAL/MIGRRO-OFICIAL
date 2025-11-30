
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CHATS, CURRENT_USER } from '../services/mockData';
import { ChevronLeft, Search, Phone, Video, MoreVertical, Send, Image as ImageIcon, Mic, Loader2, X } from 'lucide-react';
import { ChatConversation, DirectMessage } from '../types';
import { chatService } from '../lib/supabase/chat';
import { storageService } from '../lib/supabase/storage';
import { useAuth } from '../contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatViewProps {
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesChannelRef = useRef<RealtimeChannel | null>(null);
  const conversationsChannelRef = useRef<RealtimeChannel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
    
    // Inscrever-se em atualizações de conversas
    if (user) {
      conversationsChannelRef.current = chatService.subscribeToConversations(
        user.id,
        (updatedConversation) => {
          setConversations(prev => {
            const index = prev.findIndex(c => c.id === updatedConversation.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = {
                ...prev[index],
                lastMessage: updatedConversation.last_message_text || prev[index].lastMessage,
                lastMessageTime: updatedConversation.last_message_at 
                  ? new Date(updatedConversation.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : prev[index].lastMessageTime,
                unreadCount: updatedConversation.participant_1_id === user.id
                  ? updatedConversation.participant_1_unread_count || 0
                  : updatedConversation.participant_2_unread_count || 0,
              };
              // Mover para o topo
              return [updated[index], ...updated.filter((_, i) => i !== index)];
            }
            return prev;
          });
        }
      );
    }

    return () => {
      if (conversationsChannelRef.current) {
        chatService.unsubscribe(conversationsChannelRef.current);
      }
      if (messagesChannelRef.current) {
        chatService.unsubscribe(messagesChannelRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      
      // Inscrever-se em novas mensagens desta conversa
      if (messagesChannelRef.current) {
        chatService.unsubscribe(messagesChannelRef.current);
      }
      
      messagesChannelRef.current = chatService.subscribeToMessages(
        activeChat.id,
        (newMessage) => {
          // Buscar dados do sender
          chatService.listMessages(activeChat.id, 1).then(({ data }) => {
            if (data && data.length > 0) {
              setMessages(prev => {
                // Verificar se mensagem já existe
                if (prev.some(m => m.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, data[0]];
              });
            }
          });
        }
      );
    }

    return () => {
      if (messagesChannelRef.current) {
        chatService.unsubscribe(messagesChannelRef.current);
      }
    };
  }, [activeChat]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await chatService.listConversations();
      if (error) {
        console.error('Erro ao carregar conversas:', error);
        setConversations(MOCK_CHATS as any);
      } else {
        setConversations(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
      setConversations(MOCK_CHATS as any);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await chatService.listMessages(conversationId);
      if (error) {
        console.error('Erro ao carregar mensagens:', error);
      } else {
        setMessages(data || []);
        // Marcar como lidas
        await chatService.markAsRead(conversationId);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Arquivo não é imagem
      handleSendFile(file);
    }
  };

  const handleSendFile = async (file: File) => {
    if (!activeChat || !user) return;

    setSending(true);
    try {
      const { data: fileUrl, error: uploadError } = await storageService.uploadChatFile(
        file,
        user.id,
        activeChat.id
      );

      if (uploadError) {
        alert('Erro ao fazer upload do arquivo: ' + uploadError.message);
        return;
      }

      const { error } = await chatService.sendMessage(
        activeChat.id,
        `📎 ${file.name}`,
        undefined,
        fileUrl,
        file.name
      );

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
      } else {
        await loadMessages(activeChat.id);
        await loadConversations();
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedImage) || !activeChat || !user) return;
    
    setSending(true);
    try {
      let imageUrl: string | undefined;

      // Upload de imagem se houver
      if (selectedImage) {
        const { data, error: uploadError } = await storageService.uploadChatImage(
          selectedImage,
          user.id,
          activeChat.id
        );

        if (uploadError) {
          alert('Erro ao fazer upload da imagem: ' + uploadError.message);
          setSending(false);
          return;
        }

        imageUrl = data || undefined;
      }

      const { error } = await chatService.sendMessage(
        activeChat.id,
        inputText.trim() || (selectedImage ? '📷 Imagem' : ''),
        imageUrl
      );

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
      } else {
        setInputText('');
        setSelectedImage(null);
        setImagePreview(null);
        // Recarregar mensagens
        await loadMessages(activeChat.id);
        // Recarregar conversas para atualizar última mensagem
        await loadConversations();
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setSending(false);
    }
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
                        {conversations.map(chat => (
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
            {imagePreview && (
              <div className="mb-2 p-2 bg-white rounded-lg">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs max-h-32 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
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
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
            >
                <ImageIcon size={20} />
            </button>
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite uma mensagem..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
                    disabled={sending}
                />
            </div>
            {(inputText.trim() || selectedImage) ? (
                <button 
                    onClick={handleSendMessage} 
                    disabled={sending}
                    className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                      <Loader2 className="animate-spin text-white" size={18} />
                    ) : (
                      <Send size={18} />
                    )}
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
