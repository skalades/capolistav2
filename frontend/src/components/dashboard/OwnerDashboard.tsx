import { Topbar } from "@/components/layout/Topbar"
import { KpiCard } from "@/components/ui/KpiCard"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

export function OwnerDashboard() {
  return (
    <>
      <Topbar 
        title="Dashboard Owner" 
        context="Ringkasan bisnis hari ini" 
        actions={
          <Button variant="accent">Buat Order Baru</Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Piutang" 
            value="Rp 45.2M" 
            caption="12 order belum lunas" 
            status="danger"
            actionLabel="Lihat Detail Piutang"
            actionHref="/divisi/keuangan"
          />
          <KpiCard 
            title="Progres Produksi" 
            value="84%" 
            caption="24 order on-track" 
            status="success"
          />
          <KpiCard 
            title="Menunggu DP" 
            value="5 Order" 
            status="warning"
            actionLabel="Follow Up"
            actionHref="/orders?status=dp"
          />
        </div>

        {/* Grid 2 kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-[16px] font-semibold text-capo-ink">Order Aktif</h2>
              <span className="text-[11.5px] text-capo-ink-soft">Diperbarui baru saja</span>
            </div>
            
            <div className="overflow-x-auto">
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
                  {[
                    { id: "ORD-001", cust: "PT Maju Jaya", status: "Selesai Jahit", variant: "success" as const },
                    { id: "ORD-002", cust: "SMAN 1 Jakarta", status: "Proses Cutting", variant: "warning" as const },
                    { id: "ORD-003", cust: "Komunitas Sepeda", status: "Tertahan - Bahan", variant: "danger" as const },
                  ].map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-3 font-mono text-[12.5px] font-medium">{row.id}</td>
                      <td className="py-3 px-3 text-[13px]">{row.cust}</td>
                      <td className="py-3 px-3">
                        <Badge variant={row.variant}>{row.status}</Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button variant="secondary" size="sm">Detail</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="lg:col-span-4 bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <h2 className="font-oswald text-[16px] font-semibold text-capo-ink mb-4">Notifikasi Sistem</h2>
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-capo-line/20 rounded-panel text-[12.5px]">
                Stok benang hitam mendekati batas minimum.
              </div>
              <div className="p-3 bg-capo-danger/10 border border-capo-danger/20 rounded-panel text-[12.5px] text-capo-danger">
                ORD-003 tertunda karena bahan belum tiba.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
