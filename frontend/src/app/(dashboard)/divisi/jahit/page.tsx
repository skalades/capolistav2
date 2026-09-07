"use client"

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { KanbanBoard, KanbanColumn, KanbanCard, KanbanCardType } from "@/components/ui/KanbanBoard"
import { Button } from "@/components/ui/Button"
import { CheckSquare, Send, User, X } from "lucide-react"

// Dummy data
const ALL_ORDERS: KanbanCardType[] = [
  { id: "1", orderId: "ORD-041", customer: "Tim Futsal Galaxy", product: "Jersey Sublim (S-XL) - 24 pcs", stage: "Menunggu", deadline: "Besok", metadata: { Pola: "Reguler", Penjahit: "Ahmad" } },
  { id: "2", orderId: "ORD-042", customer: "PT Karya Abadi", product: "Kemeja Seragam - 50 pcs", stage: "Menunggu", metadata: { Pola: "Custom", Penjahit: "Belum assign" } },
  { id: "3", orderId: "ORD-039", customer: "SDN 01 Pagi", product: "Seragam Olahraga - 120 pcs", stage: "Sedang Dijahit", deadline: "3 Hari lagi", metadata: { Penjahit: "Rina & Budi", Progress: "45%" } },
  { id: "4", orderId: "ORD-035", customer: "Komunitas VESPA", product: "Jaket Windbreaker - 15 pcs", stage: "QC", metadata: { Penjahit: "Ahmad" } },
  { id: "5", orderId: "ORD-030", customer: "BEM UI", product: "PDH - 80 pcs", stage: "Selesai", metadata: { Penjahit: "Rina" } },
]

const STAGES = ["Menunggu", "Sedang Dijahit", "QC", "Selesai"]

export default function JahitPage() {
  const [activeCard, setActiveCard] = React.useState<KanbanCardType | null>(null)

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
            orders={ALL_ORDERS} 
            activeCardId={activeCard?.id} 
            onCardClick={setActiveCard} 
          />
        </div>

        {/* Right Detail Panel */}
        {activeCard && (
          <div className="w-[350px] bg-capo-panel border-l border-capo-line flex flex-col h-full shadow-xl z-10 transition-all">
            <div className="p-4 border-b border-capo-line flex items-center justify-between bg-capo-bg">
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
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="mb-6">
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Instruksi Jahit</h4>
                <div className="bg-white p-3 rounded-panel border border-capo-line text-[12.5px] text-capo-ink space-y-2">
                  <p><strong>Produk:</strong> {activeCard.product}</p>
                  <p><strong>Benang:</strong> Polyester Hitam</p>
                  <p><strong>Catatan:</strong> Perhatikan ukuran lengan, jangan sampai tertukar size M dan L.</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Checklist QC</h4>
                <div className="space-y-2">
                  {[
                    "Kerapian jahitan kerah", 
                    "Ukuran sesuai pola", 
                    "Tidak ada loncat jahit"
                  ].map((item, i) => (
                    <label key={i} className="flex items-start gap-2 text-[12.5px] text-capo-ink cursor-pointer group">
                      <input type="checkbox" className="mt-0.5 rounded-sm text-capo-accent focus:ring-capo-accent border-capo-line" />
                      <span className="group-hover:text-capo-navy">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2">Aksi</h4>
                <div className="flex gap-2">
                  <Button variant="accent" className="flex-1">Kirim ke Printing</Button>
                  <Button variant="danger" className="flex-1">Reject (Ulang)</Button>
                </div>
              </div>

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

            <div className="p-3 border-t border-capo-line bg-white">
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
