'use client';

import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/typography/Text";
import {
  type SocialLink,
  companyInfo,
  footerContact,
  footerSections,
  socialLinks,
} from "@/data/footer";
import { JSX } from "react";

// Sosyal medya ikonları
function SocialIcon({ platform }: { platform: SocialLink["platform"] }) {
  const icons: Record<SocialLink["platform"], JSX.Element> = {
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    youtube: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    github: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  };

  return icons[platform];
}

// Mail ikonu
function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// Telefon ikonu
function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

// Konum ikonu
function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="space-y-10">
      {/* Üst Bölüm - Navigasyon Linkleri */}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
        {/* Logo & Açıklama */}
        <div className="col-span-2 md:col-span-4 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-foreground">
              {companyInfo.name}
            </span>
          </Link>
          <Text size="sm" color="muted" className="mb-6 max-w-xs">
            {companyInfo.tagline}
          </Text>

          {/* Sosyal Medya */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-white hover:scale-110"
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigasyon Bölümleri */}
        {footerSections.map((section) => (
          <div key={section.title}>
            <Text as="h3" size="sm" weight="semibold" className="mb-4">
              {section.title}
            </Text>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Alt Bölüm - Telif Hakkı & Ödeme Yöntemleri */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Text size="sm" color="muted">
          © {currentYear} {companyInfo.name}. Tüm hakları saklıdır.
        </Text>

        {/* Ödeme Yöntemleri */}
        <div className="flex items-center gap-3">
          <Text size="xs" color="muted" className="mr-2">
            Güvenli Ödeme:
          </Text>
          <div className="flex items-center gap-2">
            {/* Visa */}
            <div className="flex h-8 w-12 items-center justify-center rounded bg-white border border-border">
              <svg viewBox="0 0 48 48" className="h-5 w-8">
                <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z" />
                <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z" />
                <path fill="#FFC107" d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z" />
              </svg>
            </div>
            {/* Mastercard */}
            <div className="flex h-8 w-12 items-center justify-center rounded bg-white border border-border">
              <svg viewBox="0 0 48 48" className="h-5 w-8">
                <path fill="#3F51B5" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z" />
                <circle cx="18.5" cy="24" r="9" fill="#E91E63" />
                <circle cx="29.5" cy="24" r="9" fill="#FFC107" />
                <path fill="#FF9800" d="M24,17.5c-2.066,1.746-3.5,4.279-3.5,7.5s1.434,5.754,3.5,7.5c2.066-1.746,3.5-4.279,3.5-7.5S26.066,19.246,24,17.5z" />
              </svg>
            </div>
            {/* PayPal */}
            <div className="flex h-8 w-12 items-center justify-center rounded bg-white border border-border">
              <svg viewBox="0 0 48 48" className="h-5 w-8">
                <path fill="#1565C0" d="M18.7,13.767l0.005,0.002C18.809,13.326,19.187,13,19.66,13h8.89c3.56,0,6.36,1.19,7.61,3.96 c-2.28-2.94-6.6-3.39-10.61-3.39h-6.62L18.7,13.767z" />
                <path fill="#42A5F5" d="M32.6,21.99c-0.59,3.91-3.33,6.35-7.53,6.35h-2.77c-0.53,0-0.98,0.38-1.05,0.9l-0.01,0.01l-1.01,6.08 l-0.3,1.81c-0.05,0.27,0.16,0.51,0.43,0.51h3.73c0.46,0,0.85-0.33,0.93-0.78l0.04-0.2l0.73-4.46l0.05-0.25 c0.08-0.45,0.47-0.78,0.93-0.78h0.58c3.78,0,6.75-1.49,7.62-5.81C35.24,23.66,34.4,22.36,32.6,21.99z" />
                <path fill="#1E88E5" d="M31.26,21.21c-0.18-0.05-0.37-0.1-0.56-0.14c-0.19-0.04-0.39-0.08-0.6-0.1c-0.74-0.11-1.55-0.16-2.45-0.16 h-7.41c-0.18,0-0.34,0.04-0.49,0.12c-0.29,0.14-0.51,0.41-0.56,0.74l-1.6,9.66l-0.05,0.28c0.07-0.52,0.52-0.9,1.05-0.9h2.77 c4.2,0,6.94-2.44,7.53-6.35c0.02-0.12,0.04-0.23,0.05-0.34C29.14,22.55,30.01,21.63,31.26,21.21z" />
                <path fill="#42A5F5" d="M19.6,21.67c0.05-0.33,0.27-0.6,0.56-0.74c0.15-0.08,0.31-0.12,0.49-0.12h7.41c0.9,0,1.71,0.05,2.45,0.16 c0.21,0.02,0.41,0.06,0.6,0.1c0.19,0.04,0.38,0.09,0.56,0.14c0.09,0.03,0.18,0.05,0.27,0.08c0.65,0.21,1.21,0.49,1.67,0.83 c0.3-2.82-0.01-4.74-1.24-6.19C30.79,14.09,27.93,13,23.72,13H14.4c-0.53,0-0.98,0.38-1.05,0.9l-3.87,23.21 c-0.06,0.32,0.19,0.61,0.52,0.61h4.82L16.84,27L19.6,21.67z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
