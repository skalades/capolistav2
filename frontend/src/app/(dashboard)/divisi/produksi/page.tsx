"use client"

import { apiFetch } from '@/lib/api';

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KpiCard } from "@/components/ui/KpiCard"
import { Badge } from "@/components/ui/Badge"
import { Package, Factory, Scissors, PenTool, Shirt, Printer, Hammer } from "lucide-react"

export default function ProduksiOverviewPage() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulasi fetch semua order atau kita bisa fetch per divisi jika endpoint all orders belum ada
    const fetchAllOrders = async () => {
      try {
        const res = await apiFetch(`/orders`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        } else {
          setOrders([])
        }
      } catch (err) {
        console.error("Gagal menarik data order", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllOrders()
  }, [])

  // Kalkulasi distribusi order per tahapan
  const getCount = (status: string) => orders.filter(o => (o.statusProduksi || o.status) === status).length

  return (
    <>
      <Topbar 
        title="Overview Produksi" 
        context="Pantau pergerakan antrean dan beban kerja di setiap divisi produksi pabrik" 
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Order Berjalan" 
            value={orders.filter(o => !['SELESAI', 'DRAFT', 'CANCELLED'].includes(o.statusProduksi || o.status)).length.toString()} 
            caption="Sedang dalam pabrik" 
            status="default"
          />
          <KpiCard 
            title="Bottleneck Terbesar" 
            value="Jahit" 
            caption="Berdasarkan antrean terbanyak" 
            status="warning"
          />
          <KpiCard 
            title="Selesai Minggu Ini" 
            value="12 Order" 
            status="success"
          />
          <KpiCard 
            title="Terlambat (Overdue)" 
            value="2 Order" 
            status="danger"
          />
        </div>

        <h2 className="font-oswald text-lg font-semibold text-capo-ink mt-8 mb-4">BEBAN KERJA PER DIVISI (Work In Progress)</h2>
        
        {/* WIP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-capo-navy/10 flex items-center justify-center text-capo-navy">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">Desain & Pola</h3>
                <p className="text-[11.5px] text-capo-ink-soft">Pembuatan mockup dan pola</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-capo-line pt-4">
              <span className="text-[12.5px] text-capo-ink-soft">Antrean Order:</span>
              <span className="font-mono text-2xl font-semibold text-capo-ink">{getCount('DESAIN')}</span>
            </div>
          </div>

          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-capo-navy/10 flex items-center justify-center text-capo-navy">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">Cutting</h3>
                <p className="text-[11.5px] text-capo-ink-soft">Pemotongan kain bahan</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-capo-line pt-4">
              <span className="text-[12.5px] text-capo-ink-soft">Antrean Order:</span>
              <span className="font-mono text-2xl font-semibold text-capo-ink">{getCount('CUTTING')}</span>
            </div>
          </div>

          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-capo-navy/10 flex items-center justify-center text-capo-navy">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">Jahit (CMT)</h3>
                <p className="text-[11.5px] text-capo-ink-soft">Penjahitan massal/borongan</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-capo-line pt-4">
              <span className="text-[12.5px] text-capo-ink-soft">Antrean Order:</span>
              <span className="font-mono text-2xl font-semibold text-capo-ink">{getCount('JAHIT')}</span>
            </div>
          </div>

          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-capo-navy/10 flex items-center justify-center text-capo-navy">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">Printing / Sablon</h3>
                <p className="text-[11.5px] text-capo-ink-soft">Aplikasi sablon, DTF, DTG</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-capo-line pt-4">
              <span className="text-[12.5px] text-capo-ink-soft">Antrean Order:</span>
              <span className="font-mono text-2xl font-semibold text-capo-ink">{getCount('PRINTING')}</span>
            </div>
          </div>

          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-capo-navy/10 flex items-center justify-center text-capo-navy">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">Pemasangan (Finishing)</h3>
                <p className="text-[11.5px] text-capo-ink-soft">Heatpress kerah, kancing, QC</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-capo-line pt-4">
              <span className="text-[12.5px] text-capo-ink-soft">Antrean Order:</span>
              <span className="font-mono text-2xl font-semibold text-capo-ink">{getCount('PEMASANGAN')}</span>
            </div>
          </div>
          
          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm flex items-center justify-center bg-capo-line/10">
            <div className="text-center">
              <Factory className="w-8 h-8 text-capo-ink-soft mx-auto mb-2 opacity-50" />
              <p className="text-[12.5px] text-capo-ink-soft">Klik menu navigasi divisi di sidebar untuk masuk ke Kanban spesifik.</p>
            </div>
          </div>

        </div>

      </div>
    </>
  )
}
