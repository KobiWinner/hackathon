'use client';

import Link from "next/link";

import { Mail, MessageCircle, Share2 } from "lucide-react";

import { cn } from "@/lib/cn";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const legalLinks: FooterLink[] = [
  { label: "Hizmet Şartları", href: "/terms" },
  { label: "Gizlilik Politikası", href: "/privacy" },
  { label: "Çerez Politikası", href: "/cookies" },
];

const socialLinks = [
  {
    label: "Email",
    href: "mailto:info@acme.com",
    icon: Mail,
    external: false,
  },
  {
    label: "Paylaş",
    href: "/share",
    icon: Share2,
    external: false,
  },
  {
    label: "İletişim",
    href: "/contact",
    icon: MessageCircle,
    external: false,
  },
];

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative shrink-0 border-t border-border/60 bg-footer-bg px-3 py-4 xs:px-4 xs:py-5 md:px-6 lg:py-6"
      role="contentinfo"
    >
      {/* Subtle gradient accent line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-3 xs:gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
        {/* Left Section - Copyright & Made with love */}
        <div className="flex flex-col gap-1 text-fluid-xs text-muted-foreground xs:gap-2 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
          <p className="flex items-center gap-1 xs:gap-2">
            <span className="font-medium text-foreground/80">© {currentYear} KOBİ</span>
            <span className="hidden text-muted-foreground/50 sm:inline">•</span>
            <span className="hidden text-muted-foreground sm:inline">Tüm hakları saklıdır</span>
          </p>
        </div>

        {/* Right Section - Links & Social */}
        <div className="flex flex-col gap-3 xs:gap-4 sm:flex-row sm:items-center sm:gap-5 md:gap-6">
          {/* Legal Links */}
          <nav
            className="flex flex-wrap gap-2 text-fluid-xs xs:gap-3 sm:gap-4"
            aria-label="Alt bilgi linkleri"
          >
            {legalLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-muted-foreground transition-all duration-200 hover:text-primary hover:underline hover:underline-offset-4",
                  "focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-1" role="group" aria-label="Sosyal medya linkleri">
            {socialLinks.map(({ label, href, icon: Icon, external }) => (
              <a
                key={href}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 xs:h-9 xs:w-9 xs:rounded-xl",
                  "hover:bg-primary/10 hover:text-primary hover:scale-110 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                )}
                aria-label={label}
              >
                <Icon className="h-3.5 w-3.5 xs:h-4 xs:w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
