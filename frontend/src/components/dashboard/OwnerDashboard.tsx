"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Topbar } from "@/components/layout/Topbar"
import { KpiCard } from "@/components/ui/KpiCard"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
};

export function OwnerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiFetch('/dashboard/owner');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Gagal load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-capo-ink-soft">Memuat data dashboard...</div>;
  }

  return (
    <>
      <Topbar 
        title="Dashboard Owner" 
        context="Ringkasan bisnis hari ini" 
        actions={
          <Link href="/orders/new">
            <Button variant="accent">Buat Order Baru</Button>
          </Link>
        }
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Piutang" 
            value={formatRupiah(data.totalPiutang || 0)} 
            caption={`${data.orderBelumLunasCount} order belum lunas`} 
            status={data.totalPiutang > 0 ? "danger" : "success"}
            actionLabel="Lihat Keuangan"
            actionHref="/divisi/keuangan"
          />
          <KpiCard 
            title="Progres Produksi" 
            value={`${data.progresPersen}%`} 
            caption={`${data.onTrackCount} dari ${data.totalAktif} order on-track`} 
            status="success"
            actionLabel="Lihat Order"
            actionHref="/orders"
          />
          <KpiCard 
            title="Menunggu DP" 
            value={`${data.menungguDpCount} Order`} 
            status={data.menungguDpCount > 0 ? "warning" : "default"}
            actionLabel="Follow Up"
            actionHref="/orders"
          />
        </div>

        {/* Grid 2 kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-[16px] font-semibold text-capo-ink">Order Aktif (Terbaru)</h2>
            </div>
            
            <div className="overflow-x-auto">
              {data.orderAktif.length === 0 ? (
                <div className="text-center p-4 text-sm text-capo-ink-soft">Belum ada order aktif.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-capo-line">
                      <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Order ID</th>
                      <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Customer</th>
                      <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Status</th>
                      <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-capo-line">
                    {data.orderAktif.map((row: any) => (
                      <tr key={row.id}>
                        <td className="py-3 px-3 font-mono text-[12.5px] font-medium">{row.id}</td>
                        <td className="py-3 px-3 text-[13px]">{row.cust}</td>
                        <td className="py-3 px-3">
                          <Badge variant={row.variant}>{row.status}</Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href={`/orders/${row.id}`}>
                            <Button variant="secondary" size="sm">Detail</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <h2 className="font-oswald text-[16px] font-semibold text-capo-ink mb-4">Notifikasi Sistem</h2>
            <div className="flex flex-col gap-3">
              {data.notifications.length === 0 ? (
                <div className="text-sm text-capo-ink-soft">Tidak ada notifikasi sistem saat ini.</div>
              ) : (
                data.notifications.map((notif: string, i: number) => (
                  <div key={i} className={`p-3 rounded-panel text-[12.5px] ${notif.includes('tertahan') ? 'bg-capo-danger/10 border border-capo-danger/20 text-capo-danger' : 'bg-capo-line/20'}`}>
                    {notif}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
