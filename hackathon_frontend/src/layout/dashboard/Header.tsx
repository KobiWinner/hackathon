'use client';

import { useState } from "react";

import { Bell, ChevronDown, Menu, Search, User2 } from "lucide-react";

import { Button } from "@/components/ui/buttons/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
};

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Hoş geldiniz! İşte güncel özetiniz",
  onMenuClick,
  showMenuButton = true,
}: DashboardHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [notificationCount] = useState(3);

  return (
    <header className="sticky top-0 z-sticky shrink-0 border-b border-header-border bg-header-bg/95 backdrop-blur-sm">
      <div className="relative flex h-22 items-center gap-2 px-3 xs:gap-3 xs:px-4 sm:gap-4 md:px-6">
        {/* Subtle gradient accent line at top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
          aria-hidden="true"
        />

        {/* Mobile/Tablet Menu Button - Controlled by showMenuButton prop */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-9 w-9 shrink-0 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary xs:h-10 xs:w-10 xs:rounded-xl"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}

        {/* Title - Hidden on mobile, visible from lg+ */}
        <div className="hidden min-w-0 lg:block">
          <h1 className="truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-fluid-xl font-bold text-transparent">
            {title}
          </h1>
          <p className="truncate text-fluid-xs text-muted-foreground">{subtitle}</p>
        </div>

        {/* Search Input - Expands on mobile */}
        <div className="group relative flex-1">
          <label htmlFor="dashboard-search" className="sr-only">
            Dashboard&apos;da ara
          </label>
          <Input
            id="dashboard-search"
            type="search"
            placeholder="Ara..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-9 w-full rounded-lg border-transparent bg-muted/60 pl-9 pr-3 text-fluid-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/40 focus:bg-white focus:shadow-md focus:shadow-primary/10 focus:ring-2 focus:ring-primary/20 group-hover:bg-muted/80 xs:h-10 xs:rounded-xl xs:pl-10 xs:pr-4 sm:w-48 md:w-56 lg:w-64 xl:w-72"
            aria-label="Arama alanı"
          />
          <Search
            className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary xs:left-3"
            aria-hidden="true"
          />
        </div>

        {/* Spacer for desktop to push right items */}
        <div className="hidden flex-1 sm:block" />

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="sm"
          className="group relative h-9 w-9 shrink-0 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 xs:h-10 xs:w-10 xs:rounded-xl"
          aria-label={`Bildirimler - ${notificationCount} yeni bildirim`}
        >
          <Bell className="h-4 w-4 transition-colors duration-200 group-hover:text-primary xs:h-5 xs:w-5" aria-hidden="true" />
          {notificationCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-[9px] font-bold text-white shadow-lg shadow-primary/30 ring-2 ring-white xs:h-5 xs:w-5 xs:text-[10px]"
              aria-hidden="true"
            >
              {notificationCount}
            </span>
          )}
        </Button>

        {/* User Profile */}
        <button
          className={cn(
            "group flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1.5 transition-all duration-200 xs:gap-3 xs:rounded-xl xs:px-2 xs:py-2 md:px-3",
            "hover:bg-muted/80 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
          aria-label="Kullanıcı menüsü"
          aria-haspopup="menu"
        >
          {/* Avatar */}
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary via-accent to-secondary shadow-md ring-2 ring-white transition-shadow duration-200 group-hover:shadow-lg group-hover:shadow-primary/20 xs:h-9 xs:w-9 lg:h-10 lg:w-10">
            <User2
              className="absolute inset-0 h-full w-full p-1 text-white xs:p-1.5"
              aria-hidden="true"
            />
          </div>

          {/* User Info - Hidden on small, visible from md+ */}
          <div className="hidden text-left md:block">
            <p className="text-fluid-base font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
              Hüseyin Atasoy
            </p>
            <p className="text-fluid-xs text-muted-foreground">Admin</p>
          </div>

          {/* Dropdown Icon - Hidden on small, visible from md+ */}
          <ChevronDown
            className="hidden h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:translate-y-0.5 group-hover:text-foreground md:block"
            aria-hidden="true"
          />
        </button>
      </div>
    </header>
  );
}
