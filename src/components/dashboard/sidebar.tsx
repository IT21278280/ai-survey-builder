"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Settings,
  Zap,
  Plus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/forms", label: "My Forms", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-100 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-zinc-900">FormForge</span>
        <span className="ml-auto rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">AI</span>
      </div>

      {/* New Form Button */}
      <div className="px-3 py-3">
        <Link
          href="/forms/new"
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white",
            "shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          New Form
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 pb-4">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600"
                )}
              />
              {label}
              {isActive && (
                <ChevronRight className="ml-auto h-3 w-3 text-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 py-3">
        <div className="rounded-lg bg-indigo-50 px-3 py-2.5">
          <p className="text-xs font-semibold text-indigo-700">AI FormForge Pro</p>
          <p className="mt-0.5 text-[11px] text-indigo-500">Unlimited forms & AI credits</p>
        </div>
      </div>
    </aside>
  );
}

