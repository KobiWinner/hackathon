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
// NOT: Henüz oluşturulmamış sayfalar # ile işaretlenmiştir
export const footerSections: FooterSection[] = [
    {
        title: "Ürünler",
        links: [
            { label: "Tüm Ürünler", href: "/search?q=" },
            { label: "Kategoriler", href: "#" },
            { label: "Kampanyalar", href: "#" },
            { label: "Yeni Gelenler", href: "/search?q=&sort=newest" },
            { label: "En Çok Satanlar", href: "/search?q=&sort=bestseller" },
        ],
    },
    {
        title: "Kurumsal",
        links: [
            { label: "Hakkımızda", href: "#" },
            { label: "Kariyer", href: "#" },
            { label: "Basın", href: "#" },
            { label: "Blog", href: "#" },
            { label: "İletişim", href: "#" },
        ],
    },
    {
        title: "Destek",
        links: [
            { label: "Yardım Merkezi", href: "#" },
            { label: "Sıkça Sorulan Sorular", href: "#" },
            { label: "Kargo Takibi", href: "#" },
            { label: "İade & Değişim", href: "#" },
            { label: "Güvenli Ödeme", href: "#" },
        ],
    },
    {
        title: "Yasal",
        links: [
            { label: "Kullanım Koşulları", href: "#" },
            { label: "Gizlilik Politikası", href: "#" },
            { label: "Çerez Politikası", href: "#" },
            { label: "KVKK Aydınlatma Metni", href: "#" },
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
