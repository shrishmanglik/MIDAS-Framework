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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Immigration",
    href: "/immigration",
    icon: Globe,
    children: [
      { name: "CRS Calculator", href: "/immigration/calculator" },
      { name: "Pathways", href: "/immigration/pathways" },
      { name: "Checklist", href: "/immigration/checklist" },
    ],
  },
  {
    name: "Contracts",
    href: "/contracts",
    icon: FileText,
    children: [
      { name: "Upload", href: "/contracts/upload" },
    ],
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileCheck,
    children: [
      { name: "Generate", href: "/documents/generate" },
    ],
  },
  {
    name: "Compliance",
    href: "/compliance",
    icon: Shield,
    children: [
      { name: "Standards", href: "/compliance/standards" },
      { name: "Checklist", href: "/compliance/checklist" },
    ],
  },
  {
    name: "Legal Q&A",
    href: "/legal-qa",
    icon: MessageSquare,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden border-r border-border bg-background transition-all duration-300 lg:block",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-end p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasChildren && !collapsed) {
                      e.preventDefault();
                      toggleExpand(item.name);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>

                {hasChildren && expanded && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          pathname === child.href
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
