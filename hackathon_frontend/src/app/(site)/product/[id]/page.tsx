'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/buttons/Button';
import { Container } from '@/components/ui/Container';
import { Caption, Heading, Text } from '@/components/ui/typography/Text';

// Mock ürün verisi - gerçek projede API'den gelecek
const mockProducts = [
    {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        brand: 'Apple',
        gender: 'Unisex',
        description: 'Apple\'ın en güçlü telefonu. A17 Pro çip, 48MP kamera sistemi, Titanium tasarım ve Action Button ile gelen iPhone 15 Pro Max, profesyonel kullanıcılar için tasarlandı.',
        image_url: 'https://picsum.photos/seed/iphone15/600/600',
        category: 'Elektronik > Telefon',
        attributes: {
            'Ekran': '6.7" Super Retina XDR',
            'İşlemci': 'A17 Pro Chip',
            'RAM': '8 GB',
            'Depolama': '256 GB',
            'Kamera': '48MP + 12MP + 12MP',
            'Batarya': '4422 mAh',
            'Renk': 'Titanium Blue',
            'Garanti': '2 Yıl',
        },
        prices: [
            { provider: 'Amazon', price: 64999, originalPrice: 69999, inStock: true, rating: 4.8 },
            { provider: 'Trendyol', price: 65499, originalPrice: 68999, inStock: true, rating: 4.6 },
            { provider: 'Hepsiburada', price: 66999, originalPrice: 69999, inStock: false, rating: 4.7 },
        ],
        trendScore: 95,
        totalFavorites: 2340,
    },
    {
        id: 2,
        name: 'Nike Air Max 270 React',
        brand: 'Nike',
        gender: 'Erkek',
        description: 'Nike Air Max 270 React, ikonik Air Max tasarımını modern React foam teknolojisi ile birleştiriyor. Gün boyu konfor ve şık görünüm bir arada.',
        image_url: 'https://picsum.photos/seed/nike270/600/600',
        category: 'Moda > Ayakkabı',
        attributes: {
            'Numara': '42',
            'Renk': 'Siyah/Beyaz',
            'Malzeme': 'Mesh + Sentetik',
            'Taban': 'React Foam',
            'Bağcık': 'Var',
            'Kullanım': 'Günlük',
        },
        prices: [
            { provider: 'Nike Store', price: 3299, originalPrice: 3999, inStock: true, rating: 4.9 },
            { provider: 'Sneakerbox', price: 3199, originalPrice: 3799, inStock: true, rating: 4.5 },
        ],
        trendScore: 78,
        totalFavorites: 1256,
    },
    {
        id: 3,
        name: 'Sony WH-1000XM5 Kulaklık',
        brand: 'Sony',
        gender: 'Unisex',
        description: 'Industry-leading gürültü engelleme teknolojisi ile Sony WH-1000XM5. 30 saat pil ömrü, multipoint bağlantı ve kristal netliğinde ses kalitesi.',
        image_url: 'https://picsum.photos/seed/sonyxm5/600/600',
        category: 'Elektronik > Kulaklık',
        attributes: {
            'Tip': 'Over-ear Wireless',
            'Noise Cancelling': 'Evet (ANC)',
            'Pil Ömrü': '30 Saat',
            'Şarj': 'USB-C',
            'Bluetooth': '5.2',
            'Codec': 'LDAC, AAC',
            'Ağırlık': '250g',
            'Renk': 'Silver',
        },
        prices: [
            { provider: 'MediaMarkt', price: 8999, originalPrice: 10999, inStock: true, rating: 4.8 },
            { provider: 'Teknosa', price: 9299, originalPrice: 10499, inStock: true, rating: 4.6 },
            { provider: 'Amazon', price: 8799, originalPrice: 10999, inStock: true, rating: 4.9 },
        ],
        trendScore: 88,
        totalFavorites: 1890,
    },
    {
        id: 4,
        name: 'MacBook Pro 14" M3 Pro',
        brand: 'Apple',
        gender: 'Unisex',
        description: 'M3 Pro çip ile güçlendirilmiş MacBook Pro 14. Profesyonel düzeyde performans, muhteşem Liquid Retina XDR ekran ve gün boyu pil ömrü.',
        image_url: 'https://picsum.photos/seed/macbookm3/600/600',
        category: 'Elektronik > Bilgisayar',
        attributes: {
            'Ekran': '14.2" Liquid Retina XDR',
            'Çip': 'Apple M3 Pro',
            'RAM': '18 GB',
            'SSD': '512 GB',
            'GPU': '14 Core',
            'Pil': '17 Saat',
            'Ağırlık': '1.61 kg',
            'Renk': 'Space Black',
        },
        prices: [
            { provider: 'Apple Store', price: 74999, originalPrice: 74999, inStock: true, rating: 4.9 },
            { provider: 'Mediamarkt', price: 73999, originalPrice: 76999, inStock: true, rating: 4.7 },
        ],
        trendScore: 92,
        totalFavorites: 3210,
    },
];

export default function ProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);

    // Ürünü bul
    const product = mockProducts.find(p => p.id === productId);

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Heading level={2}>Ürün Bulunamadı</Heading>
                    <Text color="muted" className="mt-2">Bu ürün mevcut değil veya kaldırılmış olabilir.</Text>
                    <Link href="/product">
                        <Button variant="solid" className="mt-4">Ürünlere Dön</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // En düşük fiyatı bul
    const lowestPrice = Math.min(...product.prices.map(p => p.price));
    const lowestPriceProvider = product.prices.find(p => p.price === lowestPrice);

    return (
        <div className="min-h-screen bg-background py-8">
            <Container size="lg">
                {/* Breadcrumb */}

                <nav className="mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Ana Sayfa</Link>
                        <span className="text-muted-foreground">/</span>
                        <Link href="/product" className="text-muted-foreground hover:text-primary transition-colors">Ürünler</Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-foreground">{product.name}</span>
                    </div>
                </nav>

                {/* Ana İçerik */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sol - Ürün Resmi */}
                    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-background">
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>

                        {/* Trend ve Favori Bilgisi */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                <div>
                                    <Text size="sm" weight="semibold">Trend Skoru</Text>
                                    <Text size="lg" weight="bold" color="primary">{product.trendScore}/100</Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">❤️</span>
                                <div>
                                    <Text size="sm" weight="semibold">Favoriler</Text>
                                    <Text size="lg" weight="bold">{product.totalFavorites.toLocaleString()}</Text>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sağ - Ürün Bilgileri */}
                    <div className="space-y-6">
                        {/* Başlık ve Marka */}
                        <div>
                            <Caption className="mb-1">{product.category}</Caption>
                            <Heading level={1} size="3xl">{product.name}</Heading>
                            <div className="flex items-center gap-3 mt-2">
                                <Text weight="semibold" color="primary">{product.brand}</Text>
                                {product.gender !== 'Unisex' && (
                                    <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full">
                                        {product.gender}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div className="bg-card rounded-xl p-4 border border-border">
                            <Text size="sm" weight="semibold" className="mb-2">Açıklama</Text>
                            <Text color="muted">{product.description}</Text>
                        </div>

                        {/* Özellikler */}
                        <div className="bg-card rounded-xl p-4 border border-border">
                            <Text size="sm" weight="semibold" className="mb-3">Özellikler</Text>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(product.attributes).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center py-2 px-3 bg-background rounded-lg">
                                        <Text size="sm" color="muted">{key}</Text>
                                        <Text size="sm" weight="medium">{value}</Text>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* En İyi Fiyat */}
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Caption>En Düşük Fiyat</Caption>
                                    <div className="flex items-baseline gap-2">
                                        <Text size="2xl" weight="bold" color="primary">
                                            ₺{lowestPrice.toLocaleString()}
                                        </Text>
                                        {lowestPriceProvider && lowestPriceProvider.originalPrice > lowestPrice && (
                                            <Text size="sm" color="muted" lineThrough>
                                                ₺{lowestPriceProvider.originalPrice.toLocaleString()}
                                            </Text>
                                        )}
                                    </div>
                                    <Text size="sm" color="muted">{lowestPriceProvider?.provider}</Text>
                                </div>
                                <Button variant="gradient" size="lg">
                                    Satın Al
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fiyat Karşılaştırma Tablosu */}
                <div className="mt-8 bg-card rounded-2xl p-6 shadow-lg border border-border">
                    <Heading level={2} size="xl" className="mb-4">Fiyat Karşılaştırma</Heading>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4">
                                        <Text size="sm" weight="semibold" color="muted">Satıcı</Text>
                                    </th>
                                    <th className="text-left py-3 px-4">
                                        <Text size="sm" weight="semibold" color="muted">Fiyat</Text>
                                    </th>
                                    <th className="text-left py-3 px-4">
                                        <Text size="sm" weight="semibold" color="muted">Stok</Text>
                                    </th>
                                    <th className="text-left py-3 px-4">
                                        <Text size="sm" weight="semibold" color="muted">Puan</Text>
                                    </th>
                                    <th className="text-right py-3 px-4">
                                        <Text size="sm" weight="semibold" color="muted">İşlem</Text>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.prices.map((priceInfo, index) => (
                                    <tr key={index} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <Text weight="medium">{priceInfo.provider}</Text>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-baseline gap-2">
                                                <Text weight="bold" color={priceInfo.price === lowestPrice ? 'success' : 'default'}>
                                                    ₺{priceInfo.price.toLocaleString()}
                                                </Text>
                                                {priceInfo.originalPrice > priceInfo.price && (
                                                    <Text size="xs" color="muted" lineThrough>
                                                        ₺{priceInfo.originalPrice.toLocaleString()}
                                                    </Text>
                                                )}
                                                {priceInfo.price === lowestPrice && (
                                                    <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">
                                                        En Ucuz
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {priceInfo.inStock ? (
                                                <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                                                    Stokta
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-danger/10 text-danger text-xs rounded-full">
                                                    Tükendi
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-warning">★</span>
                                                <Text size="sm">{priceInfo.rating}</Text>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Button
                                                variant={priceInfo.inStock ? 'solid' : 'ghost'}
                                                size="sm"
                                                disabled={!priceInfo.inStock}
                                            >
                                                {priceInfo.inStock ? 'Git' : 'Bekle'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Container>
        </div>
    );
}
