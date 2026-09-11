"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/useLogout"
import {
  LayoutDashboard,
  Package,
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
  Settings,
  Factory,
  ClipboardList,
  LogOut,
} from "lucide-react"

// ────────────────────────────────────────────────────────────
// Tipe & konstanta
// ────────────────────────────────────────────────────────────

type Role = "SUPERADMIN" | "OWNER" | "ADMIN" | "KEPALA_DIVISI" | "STAF"
type Divisi =
  | "PEMASARAN" | "PRODUKSI" | "DESAIN" | "CUTTING" | "JAHIT"
  | "PRINTING" | "PEMASANGAN" | "PROCUREMENT" | "GUDANG" | "KEUANGAN" | "HR"

interface SidebarUser {
  nama: string
  role: Role
  divisi?: Divisi
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  /** Role yang boleh melihat item ini. Kosong = semua role. */
  allowedRoles?: Role[]
  /** Divisi yang boleh melihat item ini. Kosong = semua divisi. */
  allowedDivisi?: Divisi[]
}

interface NavGroup {
  group: string
  items: NavItem[]
}

// ────────────────────────────────────────────────────────────
// Definisi navigasi
// Urutan Divisi & Alur sesuai alur produksi bisnis:
// Draft → Desain → Procurement → Printing → Pemasangan → Cutting → Jahit → Packing → Dikirim → Gudang → Keuangan
// ────────────────────────────────────────────────────────────

const sidebarNav: NavGroup[] = [
  {
    group: "Ringkasan",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
      },
      {
        title: "Manajemen Order",
        href: "/orders",
        icon: Package,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN"],
      },
    ],
  },
  {
    group: "Divisi & Alur",
    items: [
      {
        title: "Draft Order",
        href: "/divisi/draft",
        icon: FileEdit,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN"],
      },
      {
        title: "Desain & Pola",
        href: "/divisi/desain",
        icon: PenTool,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["DESAIN"],
      },
      {
        title: "Procurement",
        href: "/divisi/pembelian",
        icon: ShoppingCart,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["PROCUREMENT"],
      },
      {
        title: "Printing",
        href: "/divisi/printing",
        icon: Printer,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["PRINTING"],
      },
      {
        title: "Pemasangan",
        href: "/divisi/pemasangan",
        icon: Hammer,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["PEMASANGAN"],
      },
      {
        title: "Cutting",
        href: "/divisi/cutting",
        icon: Scissors,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["CUTTING"],
      },
      {
        title: "Jahit",
        href: "/divisi/jahit",
        icon: Shirt,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["JAHIT"],
      },
      {
        title: "Packing",
        href: "/divisi/packing",
        icon: Box,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["GUDANG"],
      },
      {
        title: "Dikirim",
        href: "/divisi/dikirim",
        icon: Truck,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["GUDANG"],
      },
      {
        title: "Gudang & Stok",
        href: "/divisi/gudang",
        icon: Warehouse,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["GUDANG"],
      },
      {
        title: "Keuangan",
        href: "/divisi/keuangan",
        icon: Wallet,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["KEUANGAN"],
      },
      {
        title: "Produksi (Koordinator)",
        href: "/divisi/produksi",
        icon: Factory,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
        allowedDivisi: ["PRODUKSI"],
      },
    ],
  },
  {
    group: "HR & Sumber Daya",
    items: [
      {
        title: "Data Karyawan",
        href: "/hr/karyawan",
        icon: Users,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN"],
      },
      {
        title: "Absensi",
        href: "/hr/absensi",
        icon: ClipboardList,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
      },
      {
        title: "Approval Borongan",
        href: "/hr/approval-borongan",
        icon: ClipboardList,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI"],
      },
      {
        title: "Penggajian",
        href: "/hr/penggajian",
        icon: Banknote,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN"],
      },
    ],
  },
  {
    group: "Sistem",
    items: [
      {
        title: "Laporan & Analitik",
        href: "/laporan",
        icon: BarChart3,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN"],
      },
      {
        title: "Pengguna & Akses",
        href: "/sistem/pengguna",
        icon: Users,
        allowedRoles: ["SUPERADMIN", "OWNER", "ADMIN"],
      },
      {
        title: "Pengaturan Sistem",
        href: "/sistem/pengaturan",
        icon: Settings,
        allowedRoles: ["SUPERADMIN"],
      },
    ],
  },
]

// ────────────────────────────────────────────────────────────
// Helper: apakah item visible untuk user ini?
// ────────────────────────────────────────────────────────────

function isItemVisible(item: NavItem, user: SidebarUser): boolean {
  // Superadmin selalu lihat semua
  if (user.role === "SUPERADMIN") return true

  // Cek role
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    if (!item.allowedRoles.includes(user.role)) return false
  }

  // Kepala divisi & staf hanya lihat item divisinya + item tanpa batasan divisi
  if (
    (user.role === "KEPALA_DIVISI" || user.role === "STAF") &&
    item.allowedDivisi &&
    item.allowedDivisi.length > 0
  ) {
    if (!user.divisi || !item.allowedDivisi.includes(user.divisi)) return false
  }

  return true
}

// Initial "letter" avatar dari nama user
function getInitials(nama: string): string {
  return nama
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ────────────────────────────────────────────────────────────
// Komponen Sidebar
// ────────────────────────────────────────────────────────────

interface SidebarProps {
  user: SidebarUser
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useLogout()

  return (
    <aside className="fixed inset-y-0 left-0 w-[230px] bg-capo-navy text-white flex flex-col z-20">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 font-oswald text-xl font-semibold tracking-wide border-b border-white/10">
        CAPOLISTA
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {sidebarNav.map((section) => {
          const visibleItems = section.items.filter((item) =>
            isItemVisible(item, user)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={section.group}>
              <h4 className="px-3 mb-2 text-[10.5px] font-semibold text-white/50 uppercase tracking-wider">
                {section.group}
              </h4>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-panel text-[12.5px] font-medium transition-colors",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4",
                            isActive ? "text-capo-accent" : "opacity-70"
                          )}
                        />
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Footer: user info + logout */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-capo-accent/20 flex items-center justify-center text-capo-accent font-bold text-sm shrink-0">
              {getInitials(user.nama)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-medium leading-tight truncate">
                {user.nama}
              </span>
              <span className="text-[10.5px] text-white/50 leading-tight">
                {user.role.replace("_", " ")}
                {user.divisi ? ` · ${user.divisi}` : ""}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-white/50 hover:text-capo-danger p-2 shrink-0 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
