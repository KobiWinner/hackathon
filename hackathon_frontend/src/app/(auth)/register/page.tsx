'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Lock, Mail, User } from 'lucide-react';

import { Button } from '@/components/ui/buttons/Button';
import { FloatingTextField } from '@/components/ui/typography/FloatingTextField';
import { Heading, Text } from '@/components/ui/typography/Text';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Register işlemi
        console.warn({ name, email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <Heading level={2}>Kayıt Ol</Heading>
                    <Text color="muted" size="sm">Yeni hesap oluşturun</Text>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FloatingTextField
                        label="Ad Soyad"
                        type="text"
                        leftIcon={<User className="h-5 w-5" />}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <FloatingTextField
                        label="E-posta"
                        type="email"
                        leftIcon={<Mail className="h-5 w-5" />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <FloatingTextField
                        label="Şifre"
                        type="password"
                        leftIcon={<Lock className="h-5 w-5" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth txt="Kayıt Ol" />
                </form>

                <Text align="center" size="sm" color="muted">
                    Zaten hesabınız var mı?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Giriş Yap
                    </Link>
                </Text>
            </div>
        </div>
    );
}
