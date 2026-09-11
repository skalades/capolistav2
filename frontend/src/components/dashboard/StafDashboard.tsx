"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { useLogout } from "@/hooks/useLogout"
import { LogOut } from "lucide-react"
import Link from "next/link"

export function StafDashboard({ user }: { user: any }) {
  const { logout } = useLogout();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiFetch('/dashboard/staf');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Gagal load dashboard staf", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
        {loading || !data ? (
          <div className="text-center p-8 text-capo-ink-soft">Memuat tugas Anda...</div>
        ) : (
          <>
            {/* Task Card Aktif */}
            {data.taskAktif ? (
              <div className="bg-capo-panel border-2 border-capo-accent rounded-panel p-4 shadow-sm relative">
                <div className="absolute top-0 right-0 bg-capo-accent text-white px-2 py-1 rounded-bl-panel rounded-tr-panel text-xs font-bold">
                  TUGAS AKTIF
                </div>
                <h2 className="font-mono text-sm text-capo-ink-soft mb-1">{data.taskAktif.orderId}</h2>
                <h3 className="font-oswald text-xl text-capo-ink mb-2">{data.taskAktif.judul}</h3>
                <p className="text-sm text-capo-ink mb-4">Target: {data.taskAktif.targetPcs} pcs</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <span className="block text-3xl font-oswald text-capo-ink">{data.taskAktif.pcsSelesai}</span>
                    <span className="text-xs text-capo-ink-soft uppercase">Selesai</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-3xl font-oswald text-capo-danger">{data.taskAktif.sisaPcs}</span>
                    <span className="text-xs text-capo-ink-soft uppercase">Sisa</span>
                  </div>
                </div>

                <Link href="/mobile/tugas">
                  <Button className="w-full" size="lg" variant="accent">Buka Tugas & Lapor Progres</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-capo-panel border border-capo-line rounded-panel p-6 text-center shadow-sm">
                <div className="inline-block p-4 bg-capo-bg rounded-full mb-3">
                  <CheckCircleIcon className="w-8 h-8 text-capo-success" />
                </div>
                <h3 className="font-oswald text-lg text-capo-ink mb-1">Semua Selesai!</h3>
                <p className="text-sm text-capo-ink-soft">Anda tidak memiliki tugas aktif saat ini.</p>
              </div>
            )}

            {/* Antrean */}
            <h3 className="font-oswald text-capo-ink text-lg mt-6 mb-2">Antrean Berikutnya</h3>
            {data.antrean.length === 0 ? (
              <p className="text-sm text-capo-ink-soft">Tidak ada antrean tugas.</p>
            ) : (
              data.antrean.map((task: any) => (
                <div key={task.id} className="bg-capo-panel border border-capo-line rounded-panel p-3 shadow-sm flex justify-between items-center mb-2">
                  <div>
                    <h4 className="font-mono text-xs text-capo-ink-soft">{task.orderId}</h4>
                    <p className="font-medium text-sm text-capo-ink">{task.targetPcs} pcs</p>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
