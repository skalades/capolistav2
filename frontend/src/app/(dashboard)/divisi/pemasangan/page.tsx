"use client"

import { API } from '@/lib/api';

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanCardType } from "@/components/ui/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { X, Settings } from "lucide-react"

const STAGES = ["Menunggu", "Proses Finishing", "QC Akhir", "Selesai"]

export default function PemasanganPage() {
  const [activeCard, setActiveCard] = React.useState<KanbanCardType | null>(null)
  const [orders, setOrders] = React.useState<KanbanCardType[]>([])
  
  // Pemasangan details
  const [pemasanganData, setPemasanganData] = React.useState<any>(null)
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Form states
  const [parameterProses, setParameterProses] = React.useState("")
  const [statusQc, setStatusQc] = React.useState("")

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/production/board/PEMASANGAN`)
      const data = await res.json()
      const formatted = data.map((order: any) => {
        const totalPcs = order.items?.reduce((acc: number, item: any) => acc + item.jumlahPcs, 0) || 0
        const product = order.items && order.items.length > 0 ? `${order.items[0].jenisProduk} - ${totalPcs} pcs` : `Custom - ${totalPcs} pcs`
        return {
          id: order.id.toString(),
          orderId: order.noOrder,
          customer: order.customer?.nama || "Unknown",
          product,
          stage: STAGES.includes(order.subStatus) ? order.subStatus : "Menunggu",
          deadline: order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : "",
          metadata: { Items: `${order.items?.length || 0} tipe` }
        }
      })
      setOrders(formatted)
    } catch (err) {
      console.error("Failed to fetch pemasangan orders", err)
    }
  }

  React.useEffect(() => {
    fetchOrders()
  }, [])

  React.useEffect(() => {
    if (activeCard) {
      fetch(`${API}/production/pemasangan/${activeCard.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Data not found")
          return res.json()
        })
        .then(data => {
          setPemasanganData(data)
          setParameterProses(data.parameterProses ? (typeof data.parameterProses === 'string' ? data.parameterProses : JSON.stringify(data.parameterProses)) : "")
          setStatusQc(data.statusQc || "")
        })
        .catch(err => {
          console.error(err)
          setPemasanganData(null)
          setParameterProses("")
          setStatusQc("")
        })
    } else {
      setPemasanganData(null)
    }
  }, [activeCard])

  const handleUpdateSubStatus = async (newStage: string) => {
    if (!activeCard) return
    try {
      await fetch(`${API}/production/order/${activeCard.id}/substatus`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subStatus: newStage })
      })
      setActiveCard(prev => prev ? { ...prev, stage: newStage } : null)
      fetchOrders()
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleNextStage = async () => {
    if (!activeCard) return
    try {
      await fetch(`${API}/production/order/${activeCard.id}/next-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      })
      setActiveCard(null)
      fetchOrders()
    } catch (err) {
      console.error("Failed to move next stage", err)
    }
  }

  const handleSavePemasangan = async () => {
    if (!activeCard) return
    setIsUpdating(true)
    try {
      let parsedParam = parameterProses
      try {
        if (parameterProses.trim().startsWith("{")) {
          parsedParam = JSON.parse(parameterProses)
        }
      } catch(e) {
        // use as string if not valid JSON
      }

      await fetch(`${API}/production/pemasangan/${activeCard.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parameterProses: parsedParam,
          statusQc: statusQc || null
        })
      })
      
      const res = await fetch(`${API}/production/pemasangan/${activeCard.id}`)
      if (res.ok) {
        const data = await res.json()
        setPemasanganData(data)
      }
      alert("Data pemasangan/finishing berhasil disimpan")
    } catch (err) {
      console.error("Failed to save pemasangan data", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Topbar 
        title="Divisi Pemasangan & Finishing" 
        context="Mengelola proses finishing, pemasangan atribut, dan QC akhir" 
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Area */}
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard 
            stages={STAGES} 
            orders={orders} 
            activeCardId={activeCard?.id} 
            onCardClick={setActiveCard} 
          />
        </div>

        {/* Right Detail Panel */}
        {activeCard && (
          <div className="w-[400px] bg-capo-panel border-l border-capo-line flex flex-col h-full shadow-xl z-10 transition-all">
            <div className="p-4 border-b border-capo-line flex items-center justify-between bg-capo-bg sticky top-0 z-20">
              <div>
                <h3 className="font-oswald text-[16px] font-semibold text-capo-ink">{activeCard.orderId}</h3>
                <p className="text-[11.5px] text-capo-ink-soft">{activeCard.customer}</p>
              </div>
              <button 
                onClick={() => setActiveCard(null)}
                className="p-1.5 hover:bg-capo-line/30 rounded-full text-capo-ink-soft hover:text-capo-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
              
              {/* Detail Order Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Instruksi / Detail Order</h4>
                <div className="bg-white p-3 rounded-panel border border-capo-line text-[12.5px] text-capo-ink space-y-2">
                  <p><strong>Produk:</strong> {activeCard.product}</p>
                </div>
              </div>

              {/* Data Pemasangan Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> Data Proses Finishing
                </h4>
                
                <div className="bg-white p-3 rounded-panel border border-capo-line space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Parameter Proses (Suhu Heat Press, Waktu Curing)</label>
                    <textarea 
                      value={parameterProses}
                      onChange={e => setParameterProses(e.target.value)}
                      placeholder='Misal: Suhu 150C, Waktu 15s'
                      rows={3}
                      className="w-full p-2 text-[11.5px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Hasil QC Akhir (Quality Control)</label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-[12px]">
                        <input type="radio" name="qc" value="LULUS" checked={statusQc === 'LULUS'} onChange={e => setStatusQc(e.target.value)} /> Lulus QC
                      </label>
                      <label className="flex items-center gap-2 text-[12px]">
                        <input type="radio" name="qc" value="REJECT" checked={statusQc === 'REJECT'} onChange={e => setStatusQc(e.target.value)} /> Reject
                      </label>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" onClick={handleSavePemasangan} disabled={isUpdating}>
                    Simpan Data Pemasangan
                  </Button>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Tahap Internal Pemasangan</h4>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map(s => (
                    <Button 
                      key={s} 
                      variant={activeCard.stage === s ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleUpdateSubStatus(s)}
                      disabled={activeCard.stage === s}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Aksi Final Section */}
              <div className="border-t border-capo-line pt-4">
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Aksi Lintas Divisi</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="accent" 
                    className="flex-1" 
                    onClick={handleNextStage}
                    disabled={statusQc !== 'LULUS'}
                  >
                    Kirim ke Gudang
                  </Button>
                </div>
                {statusQc !== 'LULUS' && (
                  <p className="text-[10px] text-capo-danger mt-1">Status QC harus 'LULUS' sebelum kirim ke Gudang.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
