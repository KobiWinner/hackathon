/**
 * Footer için navigasyon ve içerik verileri
 */

export type FooterLink = {
    label: string;
    href: string;
    external?: boolean;
};

export type FooterSection = {
    title: string;
    links: FooterLink[];
};

export type SocialLink = {
    platform: "twitter" | "facebook" | "instagram" | "linkedin" | "youtube" | "github";
    href: string;
    label: string;
};

export type FooterContact = {
    email: string;
    phone: string;
    address: string;
};

// Ana navigasyon bölümleri
export const footerSections: FooterSection[] = [
    {
        title: "Ürünler",
        links: [
            { label: "Tüm Ürünler", href: "/products" },
            { label: "Kategoriler", href: "/categories" },
            { label: "Kampanyalar", href: "/campaigns" },
            { label: "Yeni Gelenler", href: "/products?sort=newest" },
            { label: "En Çok Satanlar", href: "/products?sort=bestseller" },
        ],
    },
    {
        title: "Kurumsal",
        links: [
            { label: "Hakkımızda", href: "/about" },
            { label: "Kariyer", href: "/careers" },
            { label: "Basın", href: "/press" },
            { label: "Blog", href: "/blog" },
            { label: "İletişim", href: "/contact" },
        ],
    },
    {
        title: "Destek",
        links: [
            { label: "Yardım Merkezi", href: "/help" },
            { label: "Sıkça Sorulan Sorular", href: "/faq" },
            { label: "Kargo Takibi", href: "/tracking" },
            { label: "İade & Değişim", href: "/returns" },
            { label: "Güvenli Ödeme", href: "/secure-payment" },
        ],
    },
    {
        title: "Yasal",
        links: [
            { label: "Kullanım Koşulları", href: "/terms" },
            { label: "Gizlilik Politikası", href: "/privacy" },
            { label: "Çerez Politikası", href: "/cookies" },
            { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
        ],
    },
];

// Sosyal medya linkleri
export const socialLinks: SocialLink[] = [
    {
        platform: "twitter",
        href: "https://twitter.com/kobiwinner",
        label: "Twitter",
    },
    {
        platform: "facebook",
        href: "https://facebook.com/kobiwinner",
        label: "Facebook",
    },
    {
        platform: "instagram",
        href: "https://instagram.com/kobiwinner",
        label: "Instagram",
    },
    {
        platform: "linkedin",
        href: "https://linkedin.com/company/kobiwinner",
        label: "LinkedIn",
    },
    {
        platform: "youtube",
        href: "https://youtube.com/@kobiwinner",
        label: "YouTube",
    },
    {
        platform: "github",
        href: "https://github.com/KobiWinner/hackathon",
        label: "GitHub",
    },
];

// İletişim bilgileri
export const footerContact: FooterContact = {
    email: "destek@kobiwinner.com",
    phone: "+90 (212) 555 0000",
    address: "Maslak Mah. Büyükdere Cad. No:123, Sarıyer/İstanbul, Türkiye",
};

// Ödeme yöntemleri
export const paymentMethods = [
    "visa",
    "mastercard",
    "amex",
    "troy",
    "paypal",
] as const;

// Şirket bilgileri
export const companyInfo = {
    name: "KOBİ Winner",
    shortName: "KOBİ",
    tagline: "Türkiye'nin en güvenilir alışveriş platformu",
    foundedYear: 2024,
} as const;
