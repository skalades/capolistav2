"use client"

import { apiFetch } from '@/lib/api';

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/Badge"

export default function MobileTugasPage() {
  const [data, setData] = React.useState<any>(null);
  const [operatorId, setOperatorId] = React.useState<number>(1); // Mock: Ganti dengan ID Rina
  const [pcsInput, setPcsInput] = React.useState<string>("");

  const fetchTasks = async () => {
    try {
      const res = await apiFetch(`/hr/mobile-tasks/${operatorId}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal mengambil tugas", err);
    }
  }

  React.useEffect(() => {
    fetchTasks();
  }, [operatorId]);

  const handleSubmitOutput = async () => {
    if (!data?.activeTask || !pcsInput) return;
    try {
      await apiFetch(`/hr/submit-output`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignId: data.activeTask.id,
          pcsKlaim: Number(pcsInput)
        })
      });
      alert("Berhasil lapor selesai!");
      setPcsInput("");
      fetchTasks();
    } catch (err) {
      console.error("Gagal submit", err);
    }
  };

  return (
    <>
      <div className="bg-capo-navy text-white p-4 pb-6 rounded-b-xl shadow-sm relative z-10 flex justify-between items-start">
        <div>
          <h1 className="font-oswald text-[20px] font-semibold mb-1">Halo, Operator</h1>
          <p className="text-[12px] text-white/70">Shift Pagi • Produksi</p>
        </div>
        <select 
          className="text-black text-xs p-1 rounded" 
          value={operatorId} 
          onChange={(e) => setOperatorId(Number(e.target.value))}
        >
          <option value="1">Simulasikan Op 1</option>
          <option value="2">Simulasikan Op 2</option>
          <option value="3">Simulasikan Op 3</option>
        </select>
      </div>

      <div className="px-4 pt-4 space-y-4 pb-8">
        {/* Tugas Aktif */}
        {data?.activeTask ? (
          <div>
            <h2 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 ml-1">Sedang Dikerjakan</h2>
            <div className="bg-capo-panel border-2 border-capo-accent rounded-panel p-4 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[14px] font-bold text-capo-ink">{data.activeTask.noOrder}</span>
                <Badge variant="warning">Proses</Badge>
              </div>
              
              <h3 className="font-semibold text-[15px] text-capo-ink leading-tight mb-1">
                {data.activeTask.items?.[0]?.jenisProduk || "Custom Produk"}
              </h3>
              
              <div className="bg-white p-3 rounded-md border border-capo-line mb-4 mt-4">
                <h4 className="text-[11px] font-bold text-capo-ink-soft mb-2">TARGET HARI INI:</h4>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Jml Pcs" 
                      className="border border-capo-line rounded px-2 w-20 text-center font-bold text-lg focus:ring-1 focus:ring-capo-navy"
                      value={pcsInput}
                      onChange={(e) => setPcsInput(e.target.value)}
                    />
                    <span className="text-[12px] text-capo-ink-soft self-end mb-1">pcs diselesaikan</span>
                  </div>
                  <span className="text-[12px] font-medium text-capo-accent bg-capo-accent/10 px-2 py-0.5 rounded-full inline-block w-fit">
                    Tarif Borongan: Rp {data.activeTask.tarifPerPcs}/pcs
                  </span>
                </div>
              </div>

              <Button variant="accent" className="w-full text-[14px] h-12 shadow-sm font-bold" onClick={handleSubmitOutput}>
                <CheckCircle2 className="w-5 h-5 mr-2" /> Lapor Selesai
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-panel border border-capo-line text-center text-capo-ink-soft">
            Tidak ada tugas aktif. Menunggu assign dari mandor.
          </div>
        )}

        {/* Antrean Berikutnya */}
        {data?.queue && data.queue.length > 0 && (
          <div className="pt-2">
            <h2 className="text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-2 ml-1">Antrean Berikutnya ({data.queue.length})</h2>
            <div className="space-y-3">
              {data.queue.map((item: any, idx: number) => (
                <div key={idx} className="bg-white border border-capo-line rounded-panel p-3 flex items-center justify-between opacity-70">
                  <div>
                    <div className="font-mono text-[11.5px] font-semibold text-capo-ink mb-0.5">{item.noOrder}</div>
                    <div className="text-[11.5px] text-capo-ink-soft">Menunggu giliran</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-capo-line" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
