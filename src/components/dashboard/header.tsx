import { auth } from "@/lib/auth";
import { UserMenu } from "./user-menu";
import { Bell, Search } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export async function Header({ title, description, action }: HeaderProps) {
  const session = await auth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      {/* Left: title + optional page-level action */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-zinc-900">{title}</h1>
          {description && <p className="text-xs text-zinc-500">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Right: utilities */}
      <div className="flex items-center gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
          <Search className="h-4 w-4" />
        </button>
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />
        </button>
        <div className="mx-1 h-5 w-px bg-zinc-200" />
        {session?.user && <UserMenu user={session.user} />}
      </div>
    </header>
  );
}
