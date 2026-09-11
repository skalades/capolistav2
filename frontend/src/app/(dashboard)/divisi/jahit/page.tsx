"use client"

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanCardType } from "@/components/ui/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { CurrencyInput } from "@/components/ui/CurrencyInput"
import { CheckSquare, Send, User, X } from "lucide-react"
import { apiFetch } from "@/lib/api"

const STAGES = ["Menunggu", "Sedang Dijahit", "QC", "Selesai"]


export default function JahitPage() {
  const [activeCard, setActiveCard] = React.useState<KanbanCardType | null>(null)
  const [orders, setOrders] = React.useState<KanbanCardType[]>([])
  const [operators, setOperators] = React.useState<any[]>([])
  const [orderLogs, setOrderLogs] = React.useState<any[]>([])
  const [noteInput, setNoteInput] = React.useState('')

  const fetchOrders = async () => {
    try {
      const res = await apiFetch(`/production/board/JAHIT`)
      const data = await res.json()
      const formatted = data.map((order: any) => {
        const totalPcs = order.items.reduce((acc: number, item: any) => acc + item.jumlahPcs, 0)
        const product = order.items.length > 0 ? `${order.items[0].jenisProduk} - ${totalPcs} pcs` : `Custom - ${totalPcs} pcs`
        
        let assignmentsText = null;
        let tarifText = null;
        if (order.assignments && order.assignments.length > 0) {
          assignmentsText = order.assignments.map((a: any) => a.operator.nama).join(", ")
          tarifText = order.assignments.map((a: any) => a.tarifPerPcs).join(", ")
        }

        return {
          id: order.id.toString(),
          orderId: order.noOrder,
          customer: order.customer?.nama || "Unknown",
          product,
          stage: STAGES.includes(order.subStatus) ? order.subStatus : "Menunggu",
          deadline: order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : "",
          metadata: { 
            Items: `${order.items.length} tipe`,
            ...(assignmentsText && { Assignments: assignmentsText, Tarif: tarifText })
          }
        }
      })
      setOrders(formatted)
    } catch (err) {
      console.error("Failed to fetch jahit orders", err)
    }
  }

  const fetchOperators = async () => {
    try {
      const res = await apiFetch(`/hr/operators/JAHIT`)
      const data = await res.json()
      setOperators(data)
    } catch (err) {
      console.error("Failed to fetch operators", err)
    }
  }

  const fetchLogs = async (orderId: string) => {
    try {
      const res = await apiFetch(`/orders/${orderId}/logs`)
      if (res.ok) setOrderLogs(await res.json())
    } catch (err) {
      console.error("Failed to fetch logs", err)
    }
  }

  const handleCardClick = (card: KanbanCardType) => {
    setActiveCard(card)
    setOrderLogs([])
    fetchLogs(card.id)
  }

  const handleSendNote = async () => {
    if (!activeCard || !noteInput.trim()) return
    try {
      await apiFetch(`/orders/${activeCard.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CATATAN', title: 'Catatan Divisi Jahit', desc: noteInput.trim() }),
      })
      setNoteInput('')
      fetchLogs(activeCard.id)
    } catch (err) {
      console.error("Failed to send note", err)
    }
  }

  React.useEffect(() => {
    fetchOrders()
    fetchOperators()
  }, [])


  const handleUpdateSubStatus = async (newStage: string) => {
    if (!activeCard) return
    try {
      await apiFetch(`/production/order/${activeCard.id}/substatus`, {
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
      await apiFetch(`/production/order/${activeCard.id}/next-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skipPrinting: false })
      })
      setActiveCard(null)
      fetchOrders()
    } catch (err) {
      console.error("Failed to move next stage", err)
    }
  }

  return (
    <>
      <Topbar 
        title="Divisi Jahit" 
        context="Mengelola antrean dan progres penjahitan" 
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Area */}
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard 
            stages={STAGES} 
            orders={orders} 
            activeCardId={activeCard?.id} 
            onCardClick={handleCardClick} 
          />
        </div>

        {/* Right Detail Panel */}
        {activeCard && (
          <div className="w-[350px] bg-capo-panel border-l border-capo-line flex flex-col h-full shadow-xl z-10 transition-all overflow-y-auto">
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
              
              {/* Instruksi Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Instruksi Jahit</h4>
                <div className="bg-white p-3 rounded-panel border border-capo-line text-[12.5px] text-capo-ink space-y-2">
                  <p><strong>Produk:</strong> {activeCard.product}</p>
                  <p><strong>Catatan:</strong> Kerjakan sesuai standar operasional jahit.</p>
                </div>
              </div>

              {/* Assignment Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Penugasan Penjahit
                </h4>
                
                {activeCard.metadata?.Assignments ? (
                  <div className="bg-white p-3 rounded-panel border border-capo-line text-[12.5px] mb-3">
                    <p className="font-medium text-capo-navy">{activeCard.metadata.Assignments}</p>
                    <p className="text-capo-ink-soft mt-1">Tarif: Rp {activeCard.metadata.Tarif}</p>
                  </div>
                ) : (
                  <div className="bg-capo-line/20 p-3 rounded-panel border border-capo-line border-dashed text-[11.5px] text-capo-ink-soft mb-3 text-center">
                    Belum ada penjahit yang ditugaskan.
                  </div>
                )}
                
                <form 
                  className="bg-white p-3 rounded-panel border border-capo-line space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const opId = form.operatorId.value;
                    const tarif = form.tarif.value;
                    if (!opId || !tarif) return;
                    
                    try {
                      await apiFetch(`/hr/assign-operator`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          orderId: Number(activeCard.id),
                          operatorId: Number(opId),
                          tarifPerPcs: Number(tarif)
                        })
                      });
                      fetchOrders(); // Refresh to get updated assignments
                      form.reset();
                    } catch (err) {
                      console.error("Gagal assign", err);
                    }
                  }}
                >
                  <select name="operatorId" required className="w-full text-[12px] p-2 border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy">
                    <option value="">-- Pilih Penjahit --</option>
                    {operators.map((op: any) => (
                      <option key={op.id} value={op.id}>{op.nama}</option>
                    ))}
                  </select>
                  <CurrencyInput name="tarif" required placeholder="Tarif per Pcs (Rp)" className="w-full text-[12px] p-2 border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy" />
                  <Button type="submit" size="sm" className="w-full">Tugaskan</Button>
                </form>
              </div>

              {/* Status Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Pindahkan Status Internal</h4>
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
                  <Button variant="accent" className="flex-1" onClick={handleNextStage}>Kirim ke Packing</Button>
                </div>
              </div>

              {/* ── Riwayat Komunikasi (DS §4.6) ── */}
              <div className="border-t border-capo-line pt-4">
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" /> Riwayat Komunikasi
                </h4>

                {/* Timeline */}
                <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {orderLogs.length === 0 ? (
                    <p className="text-[11.5px] text-capo-ink-soft italic text-center py-4">
                      Belum ada catatan untuk order ini.
                    </p>
                  ) : (
                    orderLogs.map((log: any, i: number) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-capo-navy mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-capo-ink">{log.title}</p>
                          <p className="text-[11.5px] text-capo-ink-soft mt-0.5">{log.desc}</p>
                          <p className="text-[10.5px] text-capo-ink-soft/70 mt-0.5">
                            {log.user?.nama || 'Sistem'} · {new Date(log.createdAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Catatan */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendNote()}
                    placeholder="Tulis catatan atau pesan ke divisi lain..."
                    className="flex-1 border border-capo-line rounded-panel px-3 py-2 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-capo-navy"
                  />
                  <Button variant="accent" size="sm" onClick={handleSendNote} disabled={!noteInput.trim()}>
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  )
}
