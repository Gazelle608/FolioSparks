import { type ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { SparkFilledIcon } from "../../assets/icons";
import { Avatar, Button, Dropdown } from "../ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface NavbarUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  isAuthor: boolean;
}

interface NavbarProps {
  user?: NavbarUser | null;
  sparksBalance?: number;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onSearch?: (query: string) => void;
  /** Optional slot for extra right-side actions */
  rightSlot?: ReactNode;
}

// ---------------------------------------------------------------------------
// Nav link config
// ---------------------------------------------------------------------------
const primaryLinks = [
  { to: "/library", label: "Library" },
  { to: "/membership", label: "Membership" },
];

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------
export function Navbar({
  user = null,
  sparksBalance = 0,
  onSignIn,
  onSignOut,
  onSearch,
  rightSlot,
}: NavbarProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim())
      return;
    onSearch?.(query.trim());
    navigate(`/library?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-primary-100">
      <nav className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0 group"
          aria-label="FolioSparks home"
        >
          <SparkFilledIcon
            size={22}
            className="text-spark transition-transform group-hover:scale-110"
          />
          <span className="font-display text-lg font-bold text-primary-900">
            Folio
            <span className="text-primary-500">Sparks</span>
          </span>
        </Link>

        {/* Primary nav (desktop) */}
        <ul className="hidden md:flex items-center gap-1 ml-4">
          {primaryLinks.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "text-primary-900 bg-primary-50"
                      : "text-primary-600 hover:text-primary-900 hover:bg-primary-50",
                  ].join(" ")}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search — desktop */}
        <div className="hidden md:flex items-center ml-2">
          {searchOpen
            ? (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="search"
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onBlur={() => !query && setSearchOpen(false)}
                    placeholder="Search titles, tags, authors…"
                    className="h-9 w-64 pl-9 pr-3 rounded-md border border-primary-200 bg-primary-50 text-sm text-primary-900 placeholder:text-primary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                  <SearchGlyph className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                </form>
              )
            : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="p-2 rounded-md text-primary-500 hover:text-primary-900 hover:bg-primary-50 transition-colors"
                >
                  <SearchGlyph className="w-5 h-5" />
                </button>
              )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Sparks balance */}
          {user && (
            <Link
              to="/membership"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-spark/15 text-primary-900 hover:bg-spark/25 transition-colors"
              title="Your Sparks balance"
            >
              <SparkFilledIcon size={16} className="text-spark" />
              <span className="text-sm font-semibold tabular-nums">
                {sparksBalance.toLocaleString()}
              </span>
            </Link>
          )}

          {/* Extra slot */}
          {rightSlot}

          {/* Signed-out actions */}
          {!user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => navigate("/signin")}
              >
                Sign in
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Start writing
              </Button>
            </>
          )}

          {/* Signed-in actions */}
          {user && (
            <>
              {user.isAuthor && (
                <Button
                  variant="primary"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate("/studio")}
                >
                  Studio
                </Button>
              )}

              <Dropdown
                align="right"
                trigger={(
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                  >
                    <Avatar
                      src={user.avatarUrl ?? undefined}
                      name={user.displayName}
                      size="sm"
                    />
                  </button>
                )}
                items={[
                  {
                    id: "profile",
                    label: "Your profile",
                    onClick: () => navigate(`/@${user.username}`),
                  },
                  {
                    id: "library",
                    label: "Your bookshelf",
                    onClick: () => navigate("/me/library"),
                  },
                  {
                    id: "settings",
                    label: "Settings",
                    onClick: () => navigate("/settings"),
                  },
                  { id: "div1", label: "", divider: true },
                  {
                    id: "signout",
                    label: "Sign out",
                    danger: true,
                    onClick: onSignOut,
                  },
                ]}
              />
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-md text-primary-600 hover:bg-primary-50"
          >
            {mobileOpen ? <CloseGlyph className="w-5 h-5" /> : <MenuGlyph className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden border-t border-primary-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <MobileSearch onSubmit={handleSearchSubmit} value={query} onChange={setQuery} />

            {primaryLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "block px-3 py-2 rounded-md text-sm font-medium",
                    isActive
                      ? "bg-primary-50 text-primary-900"
                      : "text-primary-700 hover:bg-primary-50",
                  ].join(" ")}
              >
                {link.label}
              </NavLink>
            ))}

            {user && (
              <>
                <Link
                  to="/me/library"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-primary-700 hover:bg-primary-50"
                >
                  Your bookshelf
                </Link>
                {user.isAuthor && (
                  <Link
                    to="/studio"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-primary-700 hover:bg-primary-50"
                  >
                    Author studio
                  </Link>
                )}
              </>
            )}

            {!user && (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    onSignIn?.();
                  }}
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/signup");
                  }}
                >
                  Start writing
                </Button>
              </div>
            )}

            {user && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    onSignOut?.();
                  }}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Mobile search
// ---------------------------------------------------------------------------
function MobileSearch({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="relative mb-2">
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search…"
        className="h-10 w-full pl-9 pr-3 rounded-md border border-primary-200 bg-primary-50 text-sm text-primary-900 placeholder:text-primary-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />
      <SearchGlyph className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
    </form>
  );
}

// ---------------------------------------------------------------------------
// Inline glyphs
// ---------------------------------------------------------------------------
function SearchGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
