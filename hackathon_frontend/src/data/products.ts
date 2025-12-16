// Fiyat karşılaştırma sitesi için ürün ve satıcı verileri

export type Seller = {
    id: string;
    name: string;
    logo?: string;
    price: number;
    originalPrice?: number;
    shippingCost?: number;
    freeShipping?: boolean;
    inStock: boolean;
    url: string;
    rating?: number;
};

export type Product = {
    id: string;
    title: string;
    slug: string;
    image: string;
    brand: string;
    category: string;
    rating?: number;
    reviewCount?: number;
    /** En düşük fiyat */
    lowestPrice: number;
    /** En yüksek fiyat */
    highestPrice: number;
    /** Satıcı sayısı */
    sellerCount: number;
    /** Fiyat düşüşü yüzdesi (son 30 gün) */
    priceDropPercent?: number;
    /** Satıcılar listesi */
    sellers: Seller[];
};

// Mock ürün listesi - fiyat karşılaştırma için
export const mockProducts: Product[] = [
    {
        id: '1',
        title: 'Nike Air Zoom Pegasus 40 Erkek Koşu Ayakkabısı',
        slug: 'nike-air-zoom-pegasus-40',
        image: 'https://picsum.photos/seed/nike1/400/400',
        brand: 'Nike',
        category: 'Koşu Ayakkabıları',
        rating: 4.8,
        reviewCount: 245,
        lowestPrice: 3299,
        highestPrice: 4499,
        sellerCount: 8,
        priceDropPercent: 15,
        sellers: [
            { id: 's1', name: 'Trendyol', price: 3299, originalPrice: 3899, freeShipping: true, inStock: true, url: '#', rating: 4.8 },
            { id: 's2', name: 'Hepsiburada', price: 3449, freeShipping: true, inStock: true, url: '#', rating: 4.7 },
            { id: 's3', name: 'Amazon', price: 3599, shippingCost: 29, inStock: true, url: '#', rating: 4.9 },
            { id: 's4', name: 'Intersport', price: 3799, freeShipping: true, inStock: true, url: '#', rating: 4.5 },
        ],
    },
    {
        id: '2',
        title: 'Adidas Ultraboost Light Erkek Koşu Ayakkabısı',
        slug: 'adidas-ultraboost-light',
        image: 'https://picsum.photos/seed/adidas1/400/400',
        brand: 'Adidas',
        category: 'Koşu Ayakkabıları',
        rating: 4.7,
        reviewCount: 189,
        lowestPrice: 4599,
        highestPrice: 5999,
        sellerCount: 6,
        priceDropPercent: 8,
        sellers: [
            { id: 's1', name: 'Adidas.com.tr', price: 4599, originalPrice: 5499, freeShipping: true, inStock: true, url: '#', rating: 4.9 },
            { id: 's2', name: 'Trendyol', price: 4799, freeShipping: true, inStock: true, url: '#', rating: 4.8 },
            { id: 's3', name: 'Boyner', price: 4999, freeShipping: true, inStock: true, url: '#', rating: 4.6 },
        ],
    },
    {
        id: '3',
        title: 'Decathlon Domyos 500 Koşu Bandı',
        slug: 'decathlon-domyos-500-kosu-bandi',
        image: 'https://picsum.photos/seed/treadmill/400/400',
        brand: 'Decathlon',
        category: 'Koşu Bandı',
        rating: 4.5,
        reviewCount: 87,
        lowestPrice: 12999,
        highestPrice: 15999,
        sellerCount: 3,
        priceDropPercent: 20,
        sellers: [
            { id: 's1', name: 'Decathlon', price: 12999, originalPrice: 15999, freeShipping: true, inStock: true, url: '#', rating: 4.7 },
            { id: 's2', name: 'Hepsiburada', price: 14499, freeShipping: true, inStock: true, url: '#', rating: 4.6 },
        ],
    },
    {
        id: '4',
        title: 'Nike Mercurial Superfly 9 Elite Krampon',
        slug: 'nike-mercurial-superfly-9',
        image: 'https://picsum.photos/seed/mercurial/400/400',
        brand: 'Nike',
        category: 'Kramponlar',
        rating: 4.9,
        reviewCount: 312,
        lowestPrice: 5999,
        highestPrice: 7499,
        sellerCount: 5,
        priceDropPercent: 12,
        sellers: [
            { id: 's1', name: 'Nike.com.tr', price: 5999, originalPrice: 6999, freeShipping: true, inStock: true, url: '#', rating: 4.9 },
            { id: 's2', name: 'Trendyol', price: 6299, freeShipping: true, inStock: true, url: '#', rating: 4.8 },
            { id: 's3', name: 'Sportive', price: 6499, freeShipping: true, inStock: true, url: '#', rating: 4.7 },
        ],
    },
    {
        id: '5',
        title: 'Xiaomi Smart Band 8 Pro Akıllı Bileklik',
        slug: 'xiaomi-smart-band-8-pro',
        image: 'https://picsum.photos/seed/xiaomi/400/400',
        brand: 'Xiaomi',
        category: 'Akıllı Bileklik',
        rating: 4.4,
        reviewCount: 523,
        lowestPrice: 1299,
        highestPrice: 1799,
        sellerCount: 12,
        priceDropPercent: 25,
        sellers: [
            { id: 's1', name: 'Mi Store', price: 1299, originalPrice: 1599, freeShipping: true, inStock: true, url: '#', rating: 4.8 },
            { id: 's2', name: 'Trendyol', price: 1349, freeShipping: true, inStock: true, url: '#', rating: 4.7 },
            { id: 's3', name: 'Amazon', price: 1399, shippingCost: 19, inStock: true, url: '#', rating: 4.9 },
            { id: 's4', name: 'N11', price: 1449, freeShipping: true, inStock: true, url: '#', rating: 4.5 },
        ],
    },
    {
        id: '6',
        title: 'The North Face Dağ Ceketi',
        slug: 'north-face-mountain-jacket',
        image: 'https://picsum.photos/seed/northface/400/400',
        brand: 'The North Face',
        category: 'Outdoor Giyim',
        rating: 4.8,
        reviewCount: 145,
        lowestPrice: 4599,
        highestPrice: 5999,
        sellerCount: 4,
        priceDropPercent: 18,
        sellers: [
            { id: 's1', name: 'Outdoor.com.tr', price: 4599, originalPrice: 5499, freeShipping: true, inStock: true, url: '#', rating: 4.8 },
            { id: 's2', name: 'Trendyol', price: 4799, freeShipping: true, inStock: true, url: '#', rating: 4.7 },
        ],
    },
];

// En çok fiyatı düşenler
export const getPriceDropProducts = (): Product[] => {
    return [...mockProducts]
        .filter(p => p.priceDropPercent && p.priceDropPercent > 0)
        .sort((a, b) => (b.priceDropPercent || 0) - (a.priceDropPercent || 0));
};

// En çok satıcısı olanlar (popüler)
export const getPopularProducts = (): Product[] => {
    return [...mockProducts].sort((a, b) => b.sellerCount - a.sellerCount);
};

// En düşük fiyatlılar
export const getLowestPriceProducts = (): Product[] => {
    return [...mockProducts].sort((a, b) => a.lowestPrice - b.lowestPrice);
};
