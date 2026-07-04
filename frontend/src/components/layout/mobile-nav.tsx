"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  FileText,
  FileCheck,
  Shield,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Immigr.", href: "/immigration", icon: Globe },
  { name: "Contracts", href: "/contracts", icon: FileText },
  { name: "Docs", href: "/documents", icon: FileCheck },
  { name: "Legal", href: "/legal-qa", icon: MessageSquare },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
