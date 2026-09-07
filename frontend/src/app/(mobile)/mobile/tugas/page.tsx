import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/Badge"

export default function MobileTugasPage() {
  return (
    <>
      <div className="bg-capo-navy text-white p-4 pb-6 rounded-b-xl shadow-sm relative z-10">
        <h1 className="font-oswald text-[20px] font-semibold mb-1">Halo, Rina</h1>
        <p className="text-[12px] text-white/70">Shift Pagi • Divisi Jahit</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Tugas Aktif (1 fokus) */}
        <div>
          <h2 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 ml-1">Sedang Dikerjakan</h2>
          <div className="bg-capo-panel border-2 border-capo-accent rounded-panel p-4 shadow-md">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[14px] font-bold text-capo-ink">ORD-039</span>
              <Badge variant="warning">Proses</Badge>
            </div>
            <h3 className="font-semibold text-[15px] text-capo-ink leading-tight mb-1">Seragam Olahraga - 120 pcs</h3>
            <p className="text-[12.5px] text-capo-ink-soft mb-4">SDN 01 Pagi</p>

            <div className="bg-white p-3 rounded-md border border-capo-line mb-4">
              <h4 className="text-[11px] font-bold text-capo-ink-soft mb-2">TARGET HARI INI:</h4>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 sm:gap-4">
                <span className="text-[32px] font-oswald font-bold text-capo-navy leading-none">45 <span className="text-[16px] text-capo-ink-soft">/ 60 pcs</span></span>
                <span className="text-[12px] font-medium text-capo-accent bg-capo-accent/10 px-2 py-0.5 rounded-full inline-block w-fit">Borongan: Rp 5.000/pcs</span>
              </div>
            </div>

            <Button variant="accent" className="w-full text-[14px] h-12 shadow-sm font-bold">
              <CheckCircle2 className="w-5 h-5 mr-2" /> Lapor Selesai (Input Pcs)
            </Button>
          </div>
        </div>

        {/* Antrean Berikutnya */}
        <div className="pt-2">
          <h2 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 ml-1">Antrean Berikutnya</h2>
          
          <div className="space-y-3">
            {[
              { id: "ORD-041", name: "Jersey Sublim (S-XL)", count: "24 pcs" },
              { id: "ORD-042", name: "Kemeja Seragam", count: "50 pcs" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-capo-line rounded-panel p-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[11.5px] font-semibold text-capo-ink mb-0.5">{item.id}</div>
                  <div className="text-[13px] font-medium text-capo-ink">{item.name}</div>
                  <div className="text-[11.5px] text-capo-ink-soft">{item.count}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-capo-line" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
