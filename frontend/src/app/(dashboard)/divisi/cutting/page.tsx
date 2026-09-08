"use client"

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanCardType } from "@/components/ui/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { CheckSquare, Send, User, X, Link as LinkIcon, Scissors } from "lucide-react"

const STAGES = ["Menunggu", "Pemotongan", "QC", "Selesai"]

export default function CuttingPage() {
  const [activeCard, setActiveCard] = React.useState<KanbanCardType | null>(null)
  const [orders, setOrders] = React.useState<KanbanCardType[]>([])
  
  // Cutting details
  const [cuttingData, setCuttingData] = React.useState<any>(null)
  const [operators, setOperators] = React.useState<any[]>([])
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Form states
  const [selectedOperator, setSelectedOperator] = React.useState("")
  const [pcsInfo, setPcsInfo] = React.useState("")
  const [qcStatus, setQcStatus] = React.useState("")

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/production/board/CUTTING`)
      const data = await res.json()
      const formatted = data.map((order: any) => {
        const totalPcs = order.items.reduce((acc: number, item: any) => acc + item.jumlahPcs, 0)
        const product = order.items.length > 0 ? `${order.items[0].jenisProduk} - ${totalPcs} pcs` : `Custom - ${totalPcs} pcs`
        return {
          id: order.id.toString(),
          orderId: order.noOrder,
          customer: order.customer?.nama || "Unknown",
          product,
          stage: STAGES.includes(order.subStatus) ? order.subStatus : "Menunggu",
          deadline: order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : "",
          metadata: { Items: `${order.items.length} tipe` }
        }
      })
      setOrders(formatted)
    } catch (err) {
      console.error("Failed to fetch cutting orders", err)
    }
  }

  const fetchOperators = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/hr/operators/CUTTING`)
      const data = await res.json()
      setOperators(data)
    } catch (err) {
      console.error("Failed to fetch operators", err)
    }
  }

  React.useEffect(() => {
    fetchOrders()
    fetchOperators()
  }, [])

  React.useEffect(() => {
    if (activeCard) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/production/cutting/${activeCard.id}`)
        .then(res => res.json())
        .then(data => {
          setCuttingData(data)
          setSelectedOperator(data.operatorId?.toString() || "")
          setQcStatus(data.statusQc || "")
          setPcsInfo(data.pcsPerUkuran ? JSON.stringify(data.pcsPerUkuran) : "")
        })
        .catch(err => console.error(err))
    } else {
      setCuttingData(null)
    }
  }, [activeCard])

  const handleUpdateSubStatus = async (newStage: string) => {
    if (!activeCard) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/production/order/${activeCard.id}/substatus`, {
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/production/order/${activeCard.id}/next-stage`, {
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

  const handleSaveCutting = async () => {
    if (!activeCard) return
    setIsUpdating(true)
    try {
      let parsedPcs = null
      try {
        parsedPcs = pcsInfo ? JSON.parse(pcsInfo) : null
      } catch(e) {
        // if not valid JSON, save as plain text inside an object
        parsedPcs = { info: pcsInfo }
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/production/cutting/${activeCard.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorId: selectedOperator ? Number(selectedOperator) : null,
          pcsPerUkuran: parsedPcs,
          statusQc: qcStatus || null
        })
      })
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/production/cutting/${activeCard.id}`)
      const data = await res.json()
      setCuttingData(data)
      alert("Data pemotongan berhasil disimpan")
    } catch (err) {
      console.error("Failed to save cutting data", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Topbar 
        title="Divisi Cutting" 
        context="Mengelola proses pemotongan kain, breakdown ukuran, dan QC Potong" 
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
              
              {/* Instruksi Desain Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Instruksi dari Desain</h4>
                <div className="bg-white p-3 rounded-panel border border-capo-line text-[12.5px] text-capo-ink space-y-2">
                  <p><strong>Produk:</strong> {activeCard.product}</p>
                  
                  {cuttingData?.desainInfo ? (
                    <>
                      <p><strong>Catatan:</strong> {cuttingData.desainInfo.catatanInstruksiCutting || "-"}</p>
                      {cuttingData.desainInfo.filePola && (
                        <a href={cuttingData.desainInfo.filePola} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-capo-accent hover:underline text-[11.5px] mt-2">
                          <LinkIcon className="w-3 h-3" /> Buka File Pola
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-capo-ink-soft italic text-[11px]">Belum ada data dari divisi desain.</p>
                  )}
                </div>
              </div>

              {/* Data Cutting Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Scissors className="w-3.5 h-3.5" /> Data Pemotongan
                </h4>
                
                <div className="bg-white p-3 rounded-panel border border-capo-line space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Tugaskan Operator Pemotong</label>
                    <select 
                      value={selectedOperator}
                      onChange={e => setSelectedOperator(e.target.value)}
                      className="w-full p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    >
                      <option value="">-- Pilih Operator --</option>
                      {operators.map((op) => (
                        <option key={op.id} value={op.id}>{op.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Breakdown Hasil Potong (Ukuran)</label>
                    <textarea 
                      value={pcsInfo}
                      onChange={e => setPcsInfo(e.target.value)}
                      placeholder='Misal: {"S": 10, "M": 25, "L": 20}'
                      rows={2}
                      className="w-full p-2 font-mono text-[11.5px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    />
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

                  <Button size="sm" className="w-full" onClick={handleSaveCutting} disabled={isUpdating}>
                    Simpan Data Potong
                  </Button>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Tahap Internal Cutting</h4>
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
                    Lulus QC, Kirim ke Jahit
                  </Button>
                </div>
                {qcStatus !== 'LULUS' && (
                  <p className="text-[10px] text-capo-danger mt-1">Status QC harus 'LULUS' sebelum pindah ke divisi Jahit.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
