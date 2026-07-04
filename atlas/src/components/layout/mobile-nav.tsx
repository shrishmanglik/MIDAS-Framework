"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Compass, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  {
    href: "/calculator",
    label: "Calculator",
    icon: Calculator,
  },
  {
    href: "/pathways",
    label: "Pathways",
    icon: Compass,
  },
  {
    href: "/checklist",
    label: "Checklist",
    icon: ClipboardCheck,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
