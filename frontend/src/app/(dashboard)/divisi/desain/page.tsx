"use client"

import { apiFetch } from '@/lib/api';

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanCardType } from "@/components/ui/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Send, User, X, FileImage, FileCode, CheckCircle, XCircle } from "lucide-react"

const STAGES = ["Menunggu", "Dikerjakan", "Revisi", "Disetujui"]

export default function DesainPage() {
  const [activeCard, setActiveCard] = React.useState<KanbanCardType | null>(null)
  const [orders, setOrders] = React.useState<KanbanCardType[]>([])
  
  // Desain states
  const [desainData, setDesainData] = React.useState<any>(null)
  const [mockupUrl, setMockupUrl] = React.useState("")
  const [polaUrl, setPolaUrl] = React.useState("")
  const [instruksi, setInstruksi] = React.useState("")
  const [isUpdating, setIsUpdating] = React.useState(false)

  const fetchOrders = async () => {
    try {
      const res = await apiFetch(`/production/board/DESAIN`)
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
      console.error("Failed to fetch desain orders", err)
    }
  }

  React.useEffect(() => {
    fetchOrders()
  }, [])

  // Fetch Desain detail whenever activeCard changes
  React.useEffect(() => {
    if (activeCard) {
      apiFetch(`/production/desain/${activeCard.id}`)
        .then(res => res.json())
        .then(data => {
          setDesainData(data)
          setMockupUrl(data.fileMockup || "")
          setPolaUrl(data.filePola || "")
          setInstruksi(data.catatanInstruksiCutting || "")
        })
        .catch(err => console.error(err))
    } else {
      setDesainData(null)
    }
  }, [activeCard])

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

  const handleSaveDesain = async () => {
    if (!activeCard) return
    setIsUpdating(true)
    try {
      await apiFetch(`/production/desain/${activeCard.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileMockup: mockupUrl,
          filePola: polaUrl,
          catatanInstruksiCutting: instruksi
        })
      })
      // refresh data
      const res = await apiFetch(`/production/desain/${activeCard.id}`)
      const data = await res.json()
      setDesainData(data)
      alert("Desain berhasil disimpan (Versi ditingkatkan)")
    } catch (err) {
      console.error("Failed to save desain", err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApproveDesain = async (status: 'DISETUJUI' | 'DITOLAK') => {
    if (!activeCard) return
    setIsUpdating(true)
    try {
      await apiFetch(`/production/desain/${activeCard.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      const res = await apiFetch(`/production/desain/${activeCard.id}`)
      const data = await res.json()
      setDesainData(data)
      
      // Auto move substatus
      if (status === 'DISETUJUI') {
        handleUpdateSubStatus('Disetujui')
      } else {
        handleUpdateSubStatus('Revisi')
      }
    } catch (err) {
      console.error("Failed to approve desain", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Topbar 
        title="Divisi Desain & Pola" 
        context="Mengelola pembuatan mockup, pola potong, dan persetujuan pelanggan" 
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
              
              {/* Desain & Pola Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider">File & Mockup</h4>
                  {desainData && (
                    <Badge variant="default" className="text-[10px] h-5 px-1.5">Versi {desainData.versi}</Badge>
                  )}
                </div>
                
                <div className="bg-white p-3 rounded-panel border border-capo-line space-y-3">
                  {desainData?.statusApproval && (
                     <div className="mb-2">
                       <span className="text-[11px] text-capo-ink-soft mr-2">Status Approval:</span>
                       <Badge variant={desainData.statusApproval === 'DISETUJUI' ? 'success' : desainData.statusApproval === 'DITOLAK' ? 'danger' : 'warning'}>
                         {desainData.statusApproval}
                       </Badge>
                     </div>
                  )}

                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft flex items-center gap-1 mb-1"><FileImage className="w-3 h-3" /> URL Mockup Desain</label>
                    <input 
                      type="text" 
                      value={mockupUrl}
                      onChange={e => setMockupUrl(e.target.value)}
                      placeholder="https://link-ke-gambar-mockup..."
                      className="w-full p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft flex items-center gap-1 mb-1"><FileCode className="w-3 h-3" /> URL File Pola (PDF/DXF)</label>
                    <input 
                      type="text" 
                      value={polaUrl}
                      onChange={e => setPolaUrl(e.target.value)}
                      placeholder="https://link-ke-file-pola..."
                      className="w-full p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-capo-ink-soft mb-1 block">Catatan Instruksi untuk Cutting</label>
                    <textarea 
                      value={instruksi}
                      onChange={e => setInstruksi(e.target.value)}
                      placeholder="Misal: Perhatikan arah serat kain untuk ukuran XL..."
                      rows={2}
                      className="w-full p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy"
                    />
                  </div>
                  <Button size="sm" className="w-full" onClick={handleSaveDesain} disabled={isUpdating}>
                    Simpan / Perbarui Versi
                  </Button>
                </div>

                {desainData?.statusApproval === 'MENUNGGU' && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="danger" size="sm" className="flex-1" onClick={() => handleApproveDesain('DITOLAK')} disabled={isUpdating}>
                      <XCircle className="w-4 h-4 mr-1" /> Tolak/Revisi
                    </Button>
                    <Button variant="success" size="sm" className="flex-1" onClick={() => handleApproveDesain('DISETUJUI')} disabled={isUpdating}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Setujui Desain
                    </Button>
                  </div>
                )}
              </div>

              {/* Status Section */}
              <div>
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Pindahkan Tahap Internal</h4>
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
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Aksi Final (Kirim ke Divisi Lain)</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="accent" 
                    className="flex-1" 
                    onClick={handleNextStage}
                    disabled={desainData?.statusApproval !== 'DISETUJUI'}
                  >
                    Kirim ke Cutting
                  </Button>
                </div>
                {desainData?.statusApproval !== 'DISETUJUI' && (
                  <p className="text-[10px] text-capo-danger mt-1">Order hanya bisa dilanjut jika desain sudah disetujui.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
