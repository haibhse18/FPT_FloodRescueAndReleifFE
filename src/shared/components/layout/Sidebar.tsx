"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  title?: string;
  subtitle?: string;
}

/**
 * Motion & timing constants (production UX spec)
 */
const SIDEBAR_PINNED_OPEN_KEY = "app.sidebar.pinnedOpen";
const SIDEBAR_EXPANDED_WIDTH = "15rem";
const SIDEBAR_COLLAPSED_WIDTH = "4rem";
const HOVER_EXPAND_DELAY_MS = 100;
const HOVER_COLLAPSE_DELAY_MS = 200;
const TEXT_FADE_IN_DELAY_MS = 75;
const SAFE_HOVER_ZONE_PX = 10;

/* ─── Shared helper: text-area class (clips to w-0 when collapsed) ─── */
const textAreaCls = (visible: boolean) =>
  `overflow-hidden whitespace-nowrap transition-all duration-200 ${
    visible ? "flex-1 opacity-100" : "w-0 opacity-0"
  }`;

/* ================================================================== *
 * Hook: useSidebarState                                              *
 * ================================================================== */
function useSidebarState() {
  const sidebarRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const textTimer = useRef<NodeJS.Timeout | null>(null);

  const [isPinnedOpen, setIsPinnedOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_PINNED_OPEN_KEY) === "true";
  });
  const [isHovered, setIsHovered] = useState(false);
  const [showTexts, setShowTexts] = useState(false);

  const isExpanded = isPinnedOpen || isHovered;

  const handleMouseEnter = useCallback(() => {
    if (isPinnedOpen) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setIsHovered(true), HOVER_EXPAND_DELAY_MS);
  }, [isPinnedOpen]);

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isPinnedOpen) return;
      const rect = sidebarRef.current?.getBoundingClientRect();
      if (rect && e.clientX > rect.right + SAFE_HOVER_ZONE_PX) {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setIsHovered(false), HOVER_COLLAPSE_DELAY_MS);
      }
    },
    [isPinnedOpen],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      if (!isPinnedOpen && !isHovered && (e.target as Element).closest("a, button")) {
        setIsHovered(true);
      }
    },
    [isPinnedOpen, isHovered],
  );

  // 2-phase text animation
  useEffect(() => {
    if (!isExpanded) { setShowTexts(false); return; }
    if (textTimer.current) clearTimeout(textTimer.current);
    textTimer.current = setTimeout(() => setShowTexts(true), TEXT_FADE_IN_DELAY_MS);
    return () => { if (textTimer.current) clearTimeout(textTimer.current); };
  }, [isExpanded]);

  // Persist state and update CSS variable for layout offset
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
    );
    window.localStorage.setItem(SIDEBAR_PINNED_OPEN_KEY, String(isPinnedOpen));
  }, [isExpanded, isPinnedOpen]);

  return {
    sidebarRef, isExpanded, isPinnedOpen, showTexts,
    setIsPinnedOpen, handleMouseEnter, handleMouseLeave, handleFocus,
  };
}

/* ================================================================== *
 * Sub-component: SidebarHeader                                       *
 * ================================================================== */
function SidebarHeader({
  isExpanded, showTexts, isPinnedOpen, onTogglePin, title, subtitle,
}: {
  isExpanded: boolean; showTexts: boolean; isPinnedOpen: boolean;
  onTogglePin: () => void; title: string; subtitle: string;
}) {
  const visible = isExpanded && showTexts;

  return (
    <div className="shrink-0 px-2 py-3 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/10 flex-shrink-0">
          🛟
        </div>

        <div className={textAreaCls(visible)}>
          <div className="pl-3 min-w-0">
            <h1 className="text-lg font-black text-white tracking-tight uppercase leading-tight truncate">
              {title}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight truncate">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onTogglePin}
        aria-label={isPinnedOpen ? "Bỏ ghim sidebar" : "Ghim sidebar ở trạng thái mở"}
        aria-pressed={isPinnedOpen}
        className="mt-3 mx-auto flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#133249] transition-colors duration-200 h-8 w-8"
      >
        <span className={`text-base transition-transform duration-200 ${isPinnedOpen ? "rotate-180" : ""}`}>
          ❮
        </span>
      </button>
    </div>
  );
}

/* ================================================================== *
 * Sub-component: SidebarNavItem                                      *
 * ================================================================== */
function SidebarNavItem({
  item, isActive, isExpanded, showTexts,
}: {
  item: NavItem; isActive: boolean; isExpanded: boolean; showTexts: boolean;
}) {
  const visible = isExpanded && showTexts;

  return (
    <li className="group/item relative">
      <Link
        href={item.href}
        aria-label={item.label}
        className={`relative flex items-center rounded-xl py-3 font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0f2a3f] ${
          isActive
            ? "bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        {/* Fixed-width icon area — always centered in collapsed width */}
        <div className="w-12 flex items-center justify-center flex-shrink-0">
          <span
            className={`text-lg transition-transform duration-150 ${
              isActive ? "scale-110" : "group-hover/item:scale-110"
            }`}
          >
            {item.icon}
          </span>
        </div>

        {/* Text area — clips to 0 when collapsed */}
        <div className={textAreaCls(visible)}>
          <span className="text-sm font-bold tracking-wide truncate">
            {item.label}
          </span>
        </div>

        {/* Badge */}
        {item.badge != null && item.badge > 0 && (
          <span
            className={`text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm transition-all duration-150 ${
              isExpanded ? "mr-3" : "absolute top-1 right-1"
            } ${
              isActive
                ? "bg-white text-[var(--color-primary)] scale-110"
                : "bg-red-500 text-white group-hover/item:scale-110"
            }`}
          >
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}

        {/* Tooltip (collapsed only) */}
        {!isExpanded && (
          <div className="absolute left-full ml-3 pointer-events-none opacity-0 group-hover/item:opacity-100 group-hover/item:pointer-events-auto transition-opacity duration-150 z-50">
            <div className="px-2 py-1 rounded-md bg-[#0c1f2f] text-white text-xs font-semibold whitespace-nowrap border border-white/10 shadow-lg">
              {item.label}
            </div>
          </div>
        )}

        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        )}
      </Link>
    </li>
  );
}

/* ================================================================== *
 * Sub-component: SidebarFooter                                       *
 * ================================================================== */
function SidebarFooter({
  user, isExpanded, showTexts,
}: {
  user: { name: string; role: string; avatar?: string };
  isExpanded: boolean; showTexts: boolean;
}) {
  const visible = isExpanded && showTexts;

  return (
    <div className="shrink-0 px-2 py-2 bg-gradient-to-br from-white/5 to-transparent">
      <Link
        href="/profile"
        aria-label={`Hồ sơ: ${user.name}`}
        className="group flex items-center rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95 border border-white/5 hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0f2a3f] py-2"
      >
        {/* Fixed-width avatar area */}
        <div className="w-12 flex items-center justify-center flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User info — clips to 0 when collapsed */}
        <div className={`${textAreaCls(visible)} flex items-center`}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate group-hover:text-blue-200 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-gray-400 font-medium truncate group-hover:text-gray-300 transition-colors">
              {user.role}
            </p>
          </div>
          <span className="text-gray-500 group-hover:text-white transition-colors text-lg ml-2 mr-3">
            ›
          </span>
        </div>
      </Link>
    </div>
  );
}

/* ================================================================== *
 * Main Component: Sidebar                                            *
 * ================================================================== */
export default function Sidebar({
  navItems,
  user = { name: "User Account", role: "Member" },
  title = "Cứu hộ Lũ lụt",
  subtitle = "FPT Flood Rescue",
}: SidebarProps) {
  const pathname = usePathname();
  const {
    sidebarRef, isExpanded, isPinnedOpen, showTexts,
    setIsPinnedOpen, handleMouseEnter, handleMouseLeave, handleFocus,
  } = useSidebarState();

  return (
    <aside
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      className="hidden lg:flex lg:flex-col fixed left-0 top-0 bottom-0 bg-gradient-to-b from-[#133249] to-[#0f2a3f] border-r border-white/10 z-40 shadow-xl overflow-hidden"
      style={{
        width: isExpanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="flex h-full flex-col">
        <SidebarHeader
          isExpanded={isExpanded}
          showTexts={showTexts}
          isPinnedOpen={isPinnedOpen}
          onTogglePin={() => setIsPinnedOpen((prev) => !prev)}
          title={title}
          subtitle={subtitle}
        />

        <div className="h-px w-full bg-white/10 shrink-0" aria-hidden="true" />

        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="px-2 py-2">
            <ul className="space-y-1">
              {navItems.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (pathname !== "/" && pathname.startsWith(item.href) && item.href !== "/");
                return (
                  <SidebarNavItem
                    key={item.href || index}
                    item={item}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    showTexts={showTexts}
                  />
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="h-px w-full bg-white/10 shrink-0" aria-hidden="true" />

        <SidebarFooter user={user} isExpanded={isExpanded} showTexts={showTexts} />
      </div>
    </aside>
  );
}
