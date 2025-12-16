import {
    BarChart3,
    Bell,
    FileText,
    Home,
    LineChart,
    Settings,
    Shield,
    UserCog,
    UserPlus,
    Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: DashboardNavItem[];
};

/**
 * Dashboard sidebar navigasyon yapılandırması
 * Alt menüsü olan öğeler href olmadan sadece kategori olarak çalışır
 */
export const dashboardNavigation: DashboardNavItem[] = [
    {
        name: "Genel Bakış",
        href: "/dashboard",
        icon: Home,
    },
    {
        name: "Analitik",
        href: "", // Boş = sadece açılır/kapanır
        icon: BarChart3,
        children: [
            {
                name: "Özet",
                href: "/dashboard/analytics",
                icon: BarChart3,
            },
            {
                name: "Raporlar",
                href: "/dashboard/analytics/reports",
                icon: FileText,
            },
            {
                name: "Grafikler",
                href: "/dashboard/analytics/charts",
                icon: LineChart,
            },
        ],
    },
    {
        name: "Kullanıcılar",
        href: "", // Boş = sadece açılır/kapanır
        icon: Users,
        children: [
            {
                name: "Tüm Kullanıcılar",
                href: "/dashboard/users",
                icon: Users,
            },
            {
                name: "Kullanıcı Ekle",
                href: "/dashboard/users/add",
                icon: UserPlus,
            },
            {
                name: "Roller",
                href: "/dashboard/users/roles",
                icon: UserCog,
            },
        ],
    },
    {
        name: "sdfdsfdsfsdfsdfs",
        href: "", // Boş = sadece açılır/kapanır
        icon: Settings,
        children: [
            {
                name: "Genel Ayarlar",
                href: "/dashboard/settings",
                icon: Settings,
            },
            {
                name: "Bildirimler",
                href: "/dashboard/settings/notifications",
                icon: Bell,
            },
            {
                name: "Güvenlik",
                href: "/dashboard/settings/security",
                icon: Shield,
            },
        ],
    },
    {
        name: "fdghfhdfdsfsd",
        href: "", // Boş = sadece açılır/kapanır
        icon: Settings,
        children: [
            {
                name: "Genel Ayarlar",
                href: "/dashboard/settings",
                icon: Settings,
            },
            {
                name: "Bildirimler",
                href: "/dashboard/settings/notifications",
                icon: Bell,
            },
            {
                name: "Güvenlik",
                href: "/dashboard/settings/security",
                icon: Shield,
            },
        ],
    },
    {
        name: "asdasdasd",
        href: "", // Boş = sadece açılır/kapanır
        icon: Settings,
        children: [
            {
                name: "Genel Ayarlar",
                href: "/dashboard/settings",
                icon: Settings,
            },
            {
                name: "Bildirimler",
                href: "/dashboard/settings/notifications",
                icon: Bell,
            },
            {
                name: "Güvenlik",
                href: "/dashboard/settings/security",
                icon: Shield,
            },
        ],
    },
];
