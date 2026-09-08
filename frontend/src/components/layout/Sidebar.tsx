"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  Factory, 
  PenTool, 
  Scissors, 
  Shirt, 
  Printer, 
  Hammer, 
  ShoppingCart, 
  Warehouse, 
  Wallet, 
  BarChart3, 
  Users,
  Banknote,
  FileEdit,
  Box,
  Truck,
  Settings
} from "lucide-react"

const sidebarNav = [
  {
    group: "Ringkasan",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Manajemen Order", href: "/orders", icon: Package },
    ]
  },
  {
    group: "Divisi & Alur",
    items: [
      { title: "Draft", href: "/divisi/draft", icon: FileEdit },
      { title: "Design", href: "/divisi/desain", icon: PenTool },
      { title: "Procurement", href: "/divisi/pembelian", icon: ShoppingCart },
      { title: "Printing", href: "/divisi/printing", icon: Printer },
      { title: "Pemasangan", href: "/divisi/pemasangan", icon: Hammer },
      { title: "Cutting", href: "/divisi/cutting", icon: Scissors },
      { title: "Jahit", href: "/divisi/jahit", icon: Shirt },
      { title: "Packing", href: "/divisi/packing", icon: Box },
      { title: "Dikirim", href: "/divisi/dikirim", icon: Truck },
      { title: "Gudang & Stok", href: "/divisi/gudang", icon: Warehouse },
      { title: "Keuangan", href: "/divisi/keuangan", icon: Wallet },
    ]
  },
  {
    group: "Sistem",
    items: [
      { title: "Approval Borongan", href: "/hr/approval-borongan", icon: Users },
      { title: "Penggajian", href: "/hr/penggajian", icon: Banknote },
      { title: "Laporan & Analitik", href: "/laporan", icon: BarChart3 },
      { title: "Pengguna & Akses", href: "/sistem/pengguna", icon: Users },
      { title: "Pengaturan Sistem", href: "/sistem/pengaturan", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 w-[230px] bg-capo-navy text-white flex flex-col z-20">
      <div className="h-16 flex items-center px-6 font-oswald text-xl font-semibold tracking-wide border-b border-white/10">
        CAPOLISTA
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {sidebarNav.map((section, i) => (
          <div key={i}>
            <h4 className="px-3 mb-2 text-[10.5px] font-semibold text-white/50 uppercase tracking-wider">
              {section.group}
            </h4>
            <ul className="space-y-0.5">
              {section.items.map((item, j) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={j}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-panel text-[12.5px] font-medium transition-colors",
                        isActive 
                          ? "bg-white/10 text-white" 
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-capo-accent" : "opacity-70")} />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-capo-accent/20 flex items-center justify-center text-capo-accent font-bold text-sm">
              OW
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-medium leading-tight">Budi Owner</span>
              <span className="text-[10.5px] text-white/50">Owner</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              const { logoutUser } = await import("@/app/actions/auth")
              await logoutUser()
              window.location.href = "/login"
            }}
            className="text-capo-danger hover:text-red-400 p-2"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
