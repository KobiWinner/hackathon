// Spor ürünleri kategorileri

export type Subcategory = {
    id: number;
    name: string;
    slug: string;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    subcategories?: Subcategory[];
};

export const categories: Category[] = [
    {
        id: 1,
        name: 'Koşu & Yürüyüş',
        slug: 'kosu-yuruyus',
        subcategories: [
            { id: 11, name: 'Koşu Ayakkabıları', slug: 'kosu-ayakkabilari' },
            { id: 12, name: 'Yürüyüş Ayakkabıları', slug: 'yuruyus-ayakkabilari' },
            { id: 13, name: 'Koşu Kıyafetleri', slug: 'kosu-kiyafetleri' },
            { id: 14, name: 'Spor Çorapları', slug: 'spor-coraplari' },
        ],
    },
    {
        id: 2,
        name: 'Fitness & Kondisyon',
        slug: 'fitness-kondisyon',
        subcategories: [
            { id: 21, name: 'Dambıllar', slug: 'dambillar' },
            { id: 22, name: 'Koşu Bandı', slug: 'kosu-bandi' },
            { id: 23, name: 'Kondisyon Bisikleti', slug: 'kondisyon-bisikleti' },
            { id: 24, name: 'Yoga Matı', slug: 'yoga-mati' },
            { id: 25, name: 'Direnç Bantları', slug: 'direnc-bantlari' },
        ],
    },
    {
        id: 3,
        name: 'Futbol',
        slug: 'futbol',
        subcategories: [
            { id: 31, name: 'Kramponlar', slug: 'kramponlar' },
            { id: 32, name: 'Futbol Topları', slug: 'futbol-toplari' },
            { id: 33, name: 'Forma & Şort', slug: 'forma-sort' },
            { id: 34, name: 'Kaleci Eldivenleri', slug: 'kaleci-eldivenleri' },
        ],
    },
    {
        id: 4,
        name: 'Basketbol',
        slug: 'basketbol',
        subcategories: [
            { id: 41, name: 'Basketbol Ayakkabıları', slug: 'basketbol-ayakkabilari' },
            { id: 42, name: 'Basketbol Topları', slug: 'basketbol-toplari' },
            { id: 43, name: 'Basketbol Formaları', slug: 'basketbol-formalari' },
        ],
    },
    {
        id: 5,
        name: 'Bisiklet',
        slug: 'bisiklet',
        subcategories: [
            { id: 51, name: 'Dağ Bisikletleri', slug: 'dag-bisikletleri' },
            { id: 52, name: 'Şehir Bisikletleri', slug: 'sehir-bisikletleri' },
            { id: 53, name: 'Elektrikli Bisikletler', slug: 'elektrikli-bisikletler' },
            { id: 54, name: 'Bisiklet Aksesuarları', slug: 'bisiklet-aksesuarlari' },
        ],
    },
    {
        id: 6,
        name: 'Outdoor & Kamp',
        slug: 'outdoor-kamp',
        subcategories: [
            { id: 61, name: 'Çadırlar', slug: 'cadirlar' },
            { id: 62, name: 'Uyku Tulumları', slug: 'uyku-tulumlari' },
            { id: 63, name: 'Kamp Malzemeleri', slug: 'kamp-malzemeleri' },
            { id: 64, name: 'Trekking Ayakkabıları', slug: 'trekking-ayakkabilari' },
        ],
    },
    {
        id: 7,
        name: 'Yüzme',
        slug: 'yuzme',
        subcategories: [
            { id: 71, name: 'Mayo & Bikini', slug: 'mayo-bikini' },
            { id: 72, name: 'Yüzme Gözlükleri', slug: 'yuzme-gozlukleri' },
            { id: 73, name: 'Bone', slug: 'bone' },
            { id: 74, name: 'Palet & Aksesuarlar', slug: 'palet-aksesuarlar' },
        ],
    },
    {
        id: 8,
        name: 'Kış Sporları',
        slug: 'kis-sporlari',
        subcategories: [
            { id: 81, name: 'Kayak Takımları', slug: 'kayak-takimlari' },
            { id: 82, name: 'Snowboard', slug: 'snowboard' },
            { id: 83, name: 'Kayak Kıyafetleri', slug: 'kayak-kiyafetleri' },
            { id: 84, name: 'Kayak Gözlükleri', slug: 'kayak-gozlukleri' },
        ],
    },
];
