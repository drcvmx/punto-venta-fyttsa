'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

import { api } from '@/lib/api';
import { useCart } from '@/lib/store-cart-context';
import { toast } from 'sonner';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { addItem } = useCart();

    // Auto-scroll al último mensaje
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mensaje inicial cuando se abre el chat
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    role: 'assistant',
                    content: '¡Hola! 👋 Soy tu asistente virtual. Puedo ayudarte a consultar productos, precios y disponibilidad. ¿En qué puedo ayudarte?',
                },
            ]);
        }
    }, [isOpen, messages.length]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Agregar mensaje del usuario
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await api.post('/chatbot/message', {
                message: userMessage,
                conversationId,
            });

            // Guardar conversation ID para mantener contexto
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }

            // Agregar respuesta del asistente
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: response.response },
            ]);

            // Ejecutar acciones del cliente si las hay
            if (response.actions && Array.isArray(response.actions)) {
                response.actions.forEach((action: any) => {
                    if (action.type === 'ADD_TO_CART') {
                        addItem(action.payload);
                        toast.success(`Agregado al carrito: ${action.payload.name}`);
                    }
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Panel de chat */}
            {isOpen && (
                <div className="fixed bottom-24 right-0 left-0 mx-auto sm:left-auto sm:mx-0 sm:right-6 z-50 w-[calc(100%-3rem)] sm:w-96 h-[60vh] sm:h-[500px] max-h-[calc(100vh-120px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#B4BEC9]/50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-[#159A9C] text-white p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Asistente Virtual</h3>
                                <p className="text-xs text-white/80">En línea</p>
                            </div>
                        </div>
                    </div>

                    {/* Área de mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#DEEFE7]/30">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                        ? 'bg-[#159A9C] text-white shadow-md rounded-br-none'
                                        : 'bg-white border border-[#B4BEC9]/30 text-[#002333] shadow-sm rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Indicador de "escribiendo..." */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-[#B4BEC9]/30 rounded-2xl px-4 py-3 shadow-sm rounded-bl-none">
                                    <div className="flex items-center gap-2 text-[#002333]/60">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Escribiendo...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input de mensaje */}
                    <div className="p-4 bg-white border-t border-[#B4BEC9]/30">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu mensaje..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 bg-[#DEEFE7]/20 border border-[#B4BEC9]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A9C] focus:border-transparent text-sm text-[#002333] placeholder:text-[#002333]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="h-11 w-11 rounded-xl bg-[#159A9C] text-white flex items-center justify-center hover:bg-[#159A9C]/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                                aria-label="Enviar mensaje"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón flotante siempre visible */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group ${isOpen ? 'bg-[#002333]' : 'bg-[#159A9C]'
                    }`}
                aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-white transition-transform duration-300 rotate-90" />
                ) : (
                    <>
                        <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></span>
                    </>
                )}
            </button>
        </>
    );
}
