import * as React from "react"
import Link from "next/link"
import { ClipboardList, History, User } from "lucide-react"

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-capo-bg relative overflow-hidden">
      {/* Topbar navy (rounded) handled inside pages, but we can set up the main area */}
      <main className="flex-1 overflow-y-auto pb-16 custom-scrollbar">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full h-16 bg-capo-panel border-t border-capo-line flex items-center justify-around z-20 px-2">
        <Link href="/mobile/tugas" className="flex flex-col items-center gap-1 text-capo-accent">
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-medium">Tugas</span>
        </Link>
        <Link href="/mobile/riwayat" className="flex flex-col items-center gap-1 text-capo-ink-soft hover:text-capo-ink">
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">Riwayat</span>
        </Link>
        <Link href="/mobile/profil" className="flex flex-col items-center gap-1 text-capo-ink-soft hover:text-capo-ink">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  )
}
