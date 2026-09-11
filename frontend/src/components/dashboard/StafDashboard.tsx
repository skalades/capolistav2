"use client"

import { Button } from "@/components/ui/Button"
import { useLogout } from "@/hooks/useLogout"
import { LogOut } from "lucide-react"

export function StafDashboard({ user }: { user: any }) {
  const { logout } = useLogout()

  return (
    <div className="flex-1 flex flex-col bg-capo-bg overflow-y-auto">
      <div className="bg-capo-navy p-4 rounded-b-panel text-white shadow-md flex justify-between items-start">
        <div>
          <h1 className="font-oswald text-xl">Halo, {user?.nama || 'Staf'}</h1>
          <p className="text-white/70 text-sm">Divisi: {user?.divisi || 'Produksi'}</p>
        </div>
        <button
          onClick={logout}
          className="text-white/50 hover:text-capo-danger p-2 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Task Card Aktif */}
        <div className="bg-capo-panel border-2 border-capo-accent rounded-panel p-4 shadow-sm relative">
          <div className="absolute top-0 right-0 bg-capo-accent text-white px-2 py-1 rounded-bl-panel rounded-tr-panel text-xs font-bold">
            AKTIF
          </div>
          <h2 className="font-mono text-sm text-capo-ink-soft mb-1">ORD-001</h2>
          <h3 className="font-oswald text-xl text-capo-ink mb-2">Kaos Sablon PT Maju Jaya</h3>
          <p className="text-sm text-capo-ink mb-4">Target: 50 pcs (Ukuran M)</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <span className="block text-3xl font-oswald text-capo-ink">30</span>
              <span className="text-xs text-capo-ink-soft uppercase">Selesai</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-oswald text-capo-danger">20</span>
              <span className="text-xs text-capo-ink-soft uppercase">Sisa</span>
            </div>
          </div>

          <Button className="w-full" size="lg" variant="accent">Lapor Progres</Button>
        </div>

        {/* Antrean */}
        <h3 className="font-oswald text-capo-ink text-lg mt-6 mb-2">Antrean Berikutnya</h3>
        <div className="bg-capo-panel border border-capo-line rounded-panel p-3 shadow-sm flex justify-between items-center">
          <div>
            <h4 className="font-mono text-xs text-capo-ink-soft">ORD-005</h4>
            <p className="font-medium text-sm text-capo-ink">Celana Cargo (20 pcs)</p>
          </div>
          <Button variant="secondary" size="sm">Lihat</Button>
        </div>
      </div>
    </div>
  )
}
