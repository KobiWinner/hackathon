'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Container } from '@/components/ui/Container';
import { Heading, Text } from '@/components/ui/typography/Text';

function SalesPersonContent() {
    const searchParams = useSearchParams();

    const provider = searchParams.get('provider');
    const price = searchParams.get('price');
    const productName = searchParams.get('product');

    if (!provider || !price) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text color="muted" size="lg">
                    Satıcı bilgisi bulunamadı.
                </Text>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Heading level={1} size="3xl">
                    {provider}
                </Heading>
                {productName && (
                    <Text color="muted" size="lg">
                        {productName}
                    </Text>
                )}
                <Text size="2xl" weight="bold" color="primary">
                    ₺{Number(price).toLocaleString('tr-TR')}
                </Text>
            </div>
        </div>
    );
}

export default function SalesPersonPage() {
    return (
        <Container>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Text color="muted">Yükleniyor...</Text>
                </div>
            }>
                <SalesPersonContent />
            </Suspense>
        </Container>
    );
}
