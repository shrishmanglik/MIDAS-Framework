"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, LogOut, User, Menu } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-primary">
              LegalAI Studio
            </span>
          </Link>
        </div>

        {isAuthenticated && (
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/immigration"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Immigration
            </Link>
            <Link
              href="/contracts"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contracts
            </Link>
            <Link
              href="/documents"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Documents
            </Link>
            <Link
              href="/compliance"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Compliance
            </Link>
            <Link
              href="/legal-qa"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Legal Q&A
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <div className="border-b border-border px-4 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
