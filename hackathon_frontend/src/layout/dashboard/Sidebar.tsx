'use client';

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronDown, Sparkles } from "lucide-react";


import { type DashboardNavItem, dashboardNavigation } from "@/data/dashboard/navigation";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/cn";

type SidebarProps = {
  isCollapsed: boolean;
  onClose?: () => void; // Mobil için kapatma fonksiyonu
};

type NavItemComponentProps = {
  item: DashboardNavItem;
  isCollapsed: boolean;
  level?: number;
  onClose?: () => void;
};

function NavItemComponent({ item, isCollapsed, level = 0, onClose }: NavItemComponentProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  const isChildActive = item.children?.some((child) => pathname === child.href);
  const Icon = item.icon;

  // Close submenu when sidebar collapses
  // This is a valid use case for syncing local state with prop changes
  useEffect(() => {
    if (isCollapsed) {
      setIsOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [isCollapsed]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      // Link'e tıklandığında menüyü kapat
      onClose?.();
    }
  };

  // If item has children and no real href, use button instead of Link
  const isCategory = hasChildren && !item.href;

  const itemClasses = cn(
    "group relative flex w-full items-center rounded-xl py-2.5 font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ",
    // Indent based on level
    level === 0 ? "px-3" : "px-3 pl-10",
    // Active state
    isActive || isChildActive
      ? "bg-primary/10 text-primary-700"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  );

  const content = (
    <>
      {/* Active Indicator */}
      {(isActive || isChildActive) && level === 0 && (
        <span
          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-primary-600 shadow-md shadow-primary/40"
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          (isActive || isChildActive) && "text-primary"
        )}
        aria-hidden="true"
      />

      {/* Label */}
      <span
        className={cn(
          "ml-3 flex-1 whitespace-nowrap text-left transition-all duration-300",
          isCollapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
        )}
      >
        {item.name}
      </span>

      {/* Chevron for items with children */}
      {hasChildren && !isCollapsed && (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      )}
    </>
  );

  return (
    <li>
      {isCategory ? (
        <button
          onClick={handleClick}
          className={itemClasses}
          aria-expanded={isOpen}
          aria-label={item.name}
          title={isCollapsed ? item.name : undefined}
        >
          {content}
        </button>
      ) : (
        <Link
          href={item.href}
          onClick={handleClick}
          className={itemClasses}
          aria-current={isActive ? "page" : undefined}
          aria-label={item.name}
          title={isCollapsed ? item.name : undefined}
        >
          {content}
        </Link>
      )}

      {/* Children */}
      {hasChildren && isOpen && !isCollapsed && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavItemComponent
              key={child.href}
              item={child}
              isCollapsed={isCollapsed}
              level={level + 1}
              onClose={onClose}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DashboardSidebar({ isCollapsed, onClose: _onClose }: SidebarProps) {
  return (
    <nav
      className="relative flex h-full flex-col overflow-hidden border-r border-border/60 bg-white pl-4 pr-0 pb-4 text-sm"
      aria-label="Ana navigasyon menüsü"
    >
      {/* Decorative gradient orb */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Logo / Brand Area - Fixed height, no shrink */}
      <div className="relative flex h-22 shrink-0 items-center gap-3 border-b border-header-border">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 shadow-lg shadow-primary/30">
          <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div
          className={cn(
            "min-w-0 overflow-hidden transition-all duration-300",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          <h2 className="truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-fluid-base font-bold text-transparent">
            Dashboard
          </h2>
          <p className="truncate text-fluid-xs text-muted-foreground">Acme Inc.</p>
        </div>
      </div>

      {/* Scrollable Navigation Container */}
      <ScrollArea className="mt-4 min-h-0 flex-1">
        {/* İçerik padding'li, scrollbar bu padding'in üzerine overlay */}
        <div className="pr-4">
          {/* Navigation Section Header */}
          <div className="mb-3 h-5 overflow-hidden px-3">
            <p
              className={cn(
                "whitespace-nowrap text-fluid-xs font-semibold uppercase tracking-wider text-muted-foreground/70 transition-opacity duration-300",
                isCollapsed ? "opacity-0" : "opacity-100"
              )}
            >
              Menü
            </p>
          </div>

          {/* Navigation Items */}
          <ul className="space-y-1.5">
            {dashboardNavigation.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                isCollapsed={isCollapsed}
                onClose={_onClose}
              />
            ))}
          </ul>
        </div>
      </ScrollArea>
    </nav>
  );
}
