"use client"

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanCardType } from "@/components/ui/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { CheckSquare, Send, User, X, Link as LinkIcon, Printer } from "lucide-react"

const STAGES = ["Menunggu", "Proses Cetak", "Selesai"]

export default function PrintingPage() {
  const [activeCard, setActiveCard] = React.useState<KanbanCardType | null>(null)
  const [orders, setOrders] = React.useState<KanbanCardType[]>([])
  
  // Printing states
  const [printingData, setPrintingData] = React.useState<any>(null)
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Form states
  const [metodeCetak, setMetodeCetak] = React.useState("")
  const [qcStatus, setQcStatus] = React.useState("")

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:3000/production/board/PRINTING")
      const data = await res.json()
      const formatted = data.map((order: any) => {
        const totalPcs = order.items.reduce((acc: number, item: any) => acc + item.jumlahPcs, 0)
        const product = order.items.length > 0 ? `${order.items[0].jenisProduk} - ${totalPcs} pcs` : `Custom - ${totalPcs} pcs`
        return {
          id: order.id.toString(),
          orderId: order.noOrder,
          customer: order.customer?.nama || "Unknown",
          product,
          stage: order.subStatus || "Menunggu",
          deadline: order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : "",
          metadata: { Items: `${order.items.length} tipe` }
        }
      })
      setOrders(formatted)
    } catch (err) {
      console.error("Failed to fetch printing orders", err)
    }
  }

  React.useEffect(() => {
    fetchOrders()
  }, [])

  React.useEffect(() => {
    if (activeCard) {
      fetch(`http://localhost:3000/production/printing/${activeCard.id}`)
        .then(res => res.json())
        .then(data => {
          setPrintingData(data)
          setQcStatus(data.statusQc || "")
          setMetodeCetak(data.metodeCetak || "")
        })
        .catch(err => console.error(err))
    } else {
      setPrintingData(null)
    }
  }, [activeCard])

  const handleUpdateSubStatus = async (newStage: string) => {
    if (!activeCard) return
    try {
      await fetch(`http://localhost:3000/production/order/${activeCard.id}/substatus`, {
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
      await fetch(`http://localhost:3000/production/order/${activeCard.id}/next-stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      })
      setActiveCard(null)
      fetchOrders()
    } catch (err) {
      console.error("Failed to move next stage", err)
    }
  }

  const handleSavePrinting = async () => {
    if (!activeCard) return
    setIsUpdating(true)
    try {
      await fetch(`http://localhost:3000/production/printing/${activeCard.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodeCetak,
          statusQc: qcStatus || null
        })
      })
      
      const res = await fetch(`http://localhost:3000/production/printing/${activeCard.id}`)
      const data = await res.json()
      setPrintingData(data)
      alert("Data printing berhasil disimpan")
    } catch (err) {
      console.error("Failed to save printing data", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Topbar 
        title="Divisi Printing / Sablon" 
        context="Mengelola proses cetak, metode sablon, dan QC Printing" 
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
              
              {/* Instruksi/Detail Order Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Instruksi / Detail Order</h4>
                <div className="bg-white p-3 rounded-panel border border-capo-line text-[12.5px] text-capo-ink space-y-2">
                  <p><strong>Produk:</strong> {activeCard.product}</p>
                  
                  {printingData?.desainInfo ? (
                    <>
                      <p><strong>Instruksi Desain:</strong> {printingData.desainInfo.catatanInstruksiCutting || "-"}</p>
                      {printingData.desainInfo.fileMockup && (
                        <a href={printingData.desainInfo.fileMockup} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-capo-accent hover:underline text-[11.5px] mt-2">
                          <LinkIcon className="w-3 h-3" /> Buka Mockup
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-capo-ink-soft italic text-[11px]">Tidak ada instruksi khusus desain.</p>
                  )}
                </div>
              </div>

              {/* Data Printing Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5" /> Data Printing
                </h4>
                
                <div className="bg-white p-3 rounded-panel border border-capo-line space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Metode Cetak</label>
                    <select 
                      value={metodeCetak}
                      onChange={e => setMetodeCetak(e.target.value)}
                      className="w-full p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    >
                      <option value="">-- Pilih Metode --</option>
                      <option value="Sablon Manual">Sablon Manual</option>
                      <option value="DTF">DTF</option>
                      <option value="DTG">DTG</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Hasil QC (Quality Control)</label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-[12px]">
                        <input type="radio" name="qc" value="LULUS" checked={qcStatus === 'LULUS'} onChange={e => setQcStatus(e.target.value)} /> Lulus QC
                      </label>
                      <label className="flex items-center gap-2 text-[12px]">
                        <input type="radio" name="qc" value="REJECT" checked={qcStatus === 'REJECT'} onChange={e => setQcStatus(e.target.value)} /> Reject
                      </label>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" onClick={handleSavePrinting} disabled={isUpdating}>
                    Simpan Data Printing
                  </Button>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Tahap Internal Printing</h4>
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
                    disabled={qcStatus !== 'LULUS'}
                  >
                    Lulus QC, Kirim ke Pemasangan
                  </Button>
                </div>
                {qcStatus !== 'LULUS' && (
                  <p className="text-[10px] text-capo-danger mt-1">Status QC harus 'LULUS' sebelum pindah ke divisi selanjutnya.</p>
                )}
              </div>

              {/* Riwayat Komunikasi Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Riwayat Komunikasi</h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-capo-line before:to-transparent">
                  {/* Timeline items */}
                  <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-capo-navy flex items-center justify-center shrink-0 z-10 text-white shadow-sm ring-2 ring-capo-panel">
                      <User className="w-3 h-3" />
                    </div>
                    <div className="bg-white p-2 rounded-panel border border-capo-line text-[11.5px]">
                      <span className="font-semibold text-capo-ink block">Desain</span>
                      <span className="text-capo-ink">Pola sudah siap, silakan potong.</span>
                      <span className="text-capo-ink-soft text-[10px] block mt-1">10:45 AM</span>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-capo-accent flex items-center justify-center shrink-0 z-10 text-white shadow-sm ring-2 ring-capo-panel">
                      <User className="w-3 h-3" />
                    </div>
                    <div className="bg-white p-2 rounded-panel border border-capo-line text-[11.5px]">
                      <span className="font-semibold text-capo-ink block">Cutting</span>
                      <span className="text-capo-ink">Sudah dipotong, diserahkan ke jahit.</span>
                      <span className="text-capo-ink-soft text-[10px] block mt-1">13:20 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-capo-line bg-white mt-auto sticky bottom-0 z-20">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Kirim pesan/catatan..." 
                  className="flex-1 border border-capo-line rounded-badge px-3 py-1.5 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-capo-navy"
                />
                <Button size="icon" variant="secondary" className="rounded-full shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
