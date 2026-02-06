'use client';

import { useState, useEffect, useRef } from 'react';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Hash, Users, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseBrowser } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthProvider';

interface ChatRoom {
    id: string;
    name: string;
    is_premium: boolean;
    members?: number;
}

interface ChatMessage {
    id: string;
    room_id: string;
    user_id: string | null;
    content: string;
    is_system: boolean;
    created_at: string;
    profiles?: {
        soul_rider_name: string | null;
        avatar_url: string | null;
    };
}

export default function ChatPage() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isPremiumUser, setIsPremiumUser] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch rooms and profile
    useEffect(() => {
        async function initChat() {
            // 1. Fetch Rooms
            const { data: roomsData } = await supabaseBrowser
                .from('chat_rooms')
                .select('*')
                .order('created_at', { ascending: true });

            if (roomsData) {
                setRooms(roomsData);
                setSelectedRoom(roomsData[0] || null);
            }

            // 2. Fetch Profile for Premium check
            if (user) {
                const { data: profile } = await supabaseBrowser
                    .from('profiles')
                    .select('plan')
                    .eq('id', user.id)
                    .single();

                setIsPremiumUser(profile?.plan === 'premium');
            }

            setIsLoading(false);
        }
        initChat();
    }, [user]);

    // Fetch messages and subscribe
    useEffect(() => {
        if (!selectedRoom) return;

        async function fetchMessages() {
            const { data, error } = await supabaseBrowser
                .from('chat_messages')
                .select(`
                    *,
                    profiles:user_id (
                        soul_rider_name,
                        avatar_url
                    )
                `)
                .eq('room_id', selectedRoom?.id || '')
                .order('created_at', { ascending: true })
                .limit(50);

            if (data) setMessages(data as any);
        }

        fetchMessages();

        // Subscribe to new messages
        const channel = supabaseBrowser
            .channel(`room-${selectedRoom?.id || 'none'}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `room_id=eq.${selectedRoom?.id || ''}`,
                },
                async (payload) => {
                    // Fetch profile for the new message
                    const { data: profileData } = await supabaseBrowser
                        .from('profiles')
                        .select('soul_rider_name, avatar_url')
                        .eq('id', payload.new.user_id)
                        .single();

                    const newMessage = {
                        ...payload.new,
                        profiles: profileData
                    } as ChatMessage;

                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabaseBrowser.removeChannel(channel);
        };
    }, [selectedRoom]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedRoom || !user || isSending) return;

        setIsSending(true);
        const { error } = await supabaseBrowser
            .from('chat_messages')
            .insert({
                room_id: selectedRoom.id,
                user_id: user.id,
                content: messageInput.trim(),
            });

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setMessageInput('');
        }
        setIsSending(false);
    };

    if (isLoading) {
        return (
            <PageShell title="Közösség">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell title="Közösség">
            <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">

                {/* Room Selector */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 mb-4">
                    {rooms.map((room) => (
                        <Card
                            key={room.id}
                            variant={selectedRoom?.id === room.id ? 'premium' : 'glass'}
                            onClick={() => {
                                if (room.is_premium && !isPremiumUser) {
                                    alert('Ez a szoba csak Prémium tagoknak érhető el.');
                                    return;
                                }
                                setSelectedRoom(room);
                            }}
                            className={`flex-shrink-0 px-4 py-3 min-w-[140px] flex items-center gap-2 cursor-pointer transition-all ${room.is_premium && !isPremiumUser ? 'opacity-60 grayscale-[0.5]' : ''}`}
                        >
                            <div className={`p-2 rounded-xl ${room.is_premium ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                {room.is_premium ? <ShieldCheck size={16} /> : <Hash size={16} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold whitespace-nowrap">{room.name}</span>
                                <div className="flex items-center gap-1 text-[9px] text-stone-400 font-bold uppercase">
                                    <Users size={10} />
                                    <span>{room.members || 0} fő</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Chat Window */}
                <Card variant="default" className="flex-1 flex flex-col p-0 overflow-hidden bg-stone-50/50 border-stone-200/60 shadow-xl shadow-stone-200/40">
                    {/* Header */}
                    <div className="p-4 border-b border-stone-100 bg-white/80 backdrop-blur-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-stone-900">{selectedRoom?.name || 'Válassz szobát'}</h3>
                                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online közösség
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => {
                                const isOwn = msg.user_id === user?.id;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${msg.is_system ? 'justify-center py-2' : ''}`}
                                    >
                                        {msg.is_system ? (
                                            <div className="bg-stone-100/80 px-4 py-1.5 rounded-full text-[10px] font-bold text-stone-500 uppercase tracking-tight flex items-center gap-2">
                                                <ShieldCheck size={12} />
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <div className={`flex gap-3 max-w-[85%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                <div className="w-8 h-8 rounded-xl bg-white border border-stone-100 shadow-sm flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                                                    {msg.profiles?.avatar_url ? (
                                                        <img src={msg.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>✨</span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${isOwn
                                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                                        : 'bg-white text-stone-700 border border-stone-100 rounded-tl-none'
                                                        }`}>
                                                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                                    </div>
                                                    <div className={`text-[9px] font-bold text-stone-400 px-1 ${isOwn ? 'text-right' : ''}`}>
                                                        {msg.profiles?.soul_rider_name || 'Ismeretlen'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-stone-100">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="relative flex items-center gap-2"
                        >
                            <Input
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder="Írd le a gondolataid..."
                                disabled={isSending}
                                className="pr-12 rounded-2xl bg-stone-50 border-stone-200 focus:bg-white transition-all py-6 h-12"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !messageInput.trim()}
                                className="absolute right-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 disabled:bg-stone-400"
                            >
                                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            </button>
                        </form>
                    </div>
                </Card>
            </div>
        </PageShell>
    );
}

