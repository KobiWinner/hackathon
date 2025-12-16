'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/buttons/Button';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Heading, Text } from '@/components/ui/typography/Text';

// Mesaj tipi
type Message = {
    id: string;
    sender: 'user' | 'support';
    text: string;
    time: string;
};

// Örnek başlangıç mesajları
const initialMessages: Message[] = [
    {
        id: '1',
        sender: 'support',
        text: 'Merhaba! Size nasıl yardımcı olabilirim?',
        time: '14:30',
    },
];

export default function CustomerSupportPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mesajlar değişince en alta scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Mesaj gönder
    const sendMessage = () => {
        if (!inputValue.trim()) {return;}

        const now = new Date();
        const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        // Kullanıcı mesajı ekle
        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue.trim(),
            time,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');

        // Müşteri hizmetleri yazıyor animasyonu
        setIsTyping(true);

        // 1-2 saniye sonra otomatik yanıt
        setTimeout(() => {
            setIsTyping(false);
            const supportMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'support',
                text: getAutoReply(userMessage.text),
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, supportMessage]);
        }, 1500);
    };

    // Enter tuşu ile gönder
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-8">
            <div className="container mx-auto max-w-2xl px-4">
                {/* Header */}
                <div className="mb-4 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                        <span className="text-xl">💬</span>
                    </div>
                    <div>
                        <Heading level={4}>Müşteri Hizmetleri</Heading>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
                    {/* Messages Area */}
                    <ScrollArea
                        className="h-[500px] p-4"
                        orientation="vertical"
                    >
                        <div ref={scrollRef} className="flex flex-col gap-3">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex items-center gap-2 self-start">
                                    <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="border-t border-slate-200 p-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <Input
                                    placeholder="Mesajınızı yazın..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <Button
                                variant="solid"
                                onClick={sendMessage}
                                disabled={!inputValue.trim()}
                                icon={<span>📤</span>}
                                txt="Gönder"
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                        <Button
                            key={action}
                            variant="ghost"
                            size="sm"
                            onClick={() => setInputValue(action)}
                            txt={action}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Mesaj Balonu Component
function MessageBubble({ message }: { message: Message }) {
    const isUser = message.sender === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser
                    ? 'rounded-br-sm bg-primary text-white'
                    : 'rounded-bl-sm bg-slate-100 text-foreground'
                    }`}
            >
                <Text size="sm" color={isUser ? 'white' : 'default'}>
                    {message.text}
                </Text>
                <Text
                    size="xs"
                    color={isUser ? 'white' : 'muted'}
                    className={`mt-1 text-right ${isUser ? 'opacity-80' : ''}`}
                >
                    {message.time}
                </Text>
            </div>
        </div>
    );
}

// Hızlı Aksiyonlar
const quickActions = [
    'Sipariş durumu',
    'İade talebi',
    'Ödeme sorunu',
    'Kargo bilgisi',
    'Sipariş iptal',
];

// Otomatik Yanıt Fonksiyonu
function getAutoReply(userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (message.includes('sipariş') || message.includes('durumu')) {
        return 'Siparişinizi kontrol ediyorum. Sipariş numaranızı paylaşır mısınız?';
    }
    if (message.includes('iade') || message.includes('geri')) {
        return 'İade talebiniz için sipariş detaylarınızı alabilir miyim? İade işlemi 3-5 iş günü içinde tamamlanır.';
    }
    if (message.includes('ödeme') || message.includes('para')) {
        return 'Ödeme ile ilgili sorununuzu anlayabilmem için biraz daha detay verir misiniz?';
    }
    if (message.includes('kargo') || message.includes('teslimat')) {
        return 'Kargonuz yola çıkmış durumda. Tahmini teslimat süresi 2-3 iş günüdür.';
    }
    if (message.includes('merhaba') || message.includes('selam')) {
        return 'Merhaba! Size nasıl yardımcı olabilirim? 😊';
    }
    if (message.includes('teşekkür') || message.includes('sağol')) {
        return 'Rica ederim! Başka bir konuda yardımcı olabilir miyim?';
    }
    if (message.includes('sipariş') || message.includes('iptal')) {
        return 'Siparişinizi iptal ediyorum. Sipariş numaranızı paylaşır mısınız?';
    }

    return 'Talebinizi aldım. En kısa sürede size yardımcı olacağız. Başka bir sorunuz var mı?';
}
