"use client"

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { KpiCard } from "@/components/ui/KpiCard"
import { Calculator, Download, Plus, Search } from "lucide-react"

export default function PenggajianPage() {
  const [penggajianList, setPenggajianList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isGenerateModalOpen, setGenerateModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // State for Generate Modal
  const [generateBulan, setGenerateBulan] = React.useState(new Date().getMonth() + 1);
  const [generateTahun, setGenerateTahun] = React.useState(new Date().getFullYear());
  const [generateUserId, setGenerateUserId] = React.useState("");

  const fetchPenggajian = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/hr/penggajian");
      if (res.ok) {
        const data = await res.json();
        setPenggajianList(data);
      }
    } catch (err) {
      console.error("Gagal menarik data penggajian", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPenggajian();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateUserId) {
      alert("Pilih Karyawan terlebih dahulu!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/hr/penggajian/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(generateUserId),
          periodeBulan: Number(generateBulan),
          periodeTahun: Number(generateTahun)
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Gagal generate gaji");
      } else {
        setGenerateModalOpen(false);
        fetchPenggajian();
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPengeluaran = penggajianList.reduce((acc, curr) => acc + Number(curr.totalUpahBersih), 0);
  const totalSlip = penggajianList.length;

  return (
    <div className="flex flex-col min-h-screen bg-capo-bg">
      <Topbar 
        title="Penggajian Karyawan" 
        context="Manajemen slip gaji borongan, harian, dan bulanan" 
      />
      
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Total Estimasi Gaji" 
            value={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`} 
            caption="Semua slip bulan ini"
            status="default"
          />
          <KpiCard 
            title="Slip Gaji Tercetak" 
            value={totalSlip} 
            caption="Data penggajian tersimpan"
            status="success"
          />
          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm flex flex-col justify-center gap-3">
            <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">Tindakan Cepat</h3>
            <Button className="w-full" onClick={() => setGenerateModalOpen(true)}>
              <Calculator className="w-4 h-4 mr-2" /> Hitung & Generate Gaji
            </Button>
          </div>
        </div>

        <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden shadow-sm">
          <div className="p-4 border-b border-capo-line flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="font-oswald text-lg font-semibold text-capo-ink">DAFTAR PENGGAJIAN</h2>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-capo-ink-soft" />
              <input 
                type="text" 
                placeholder="Cari nama karyawan..." 
                className="w-full pl-9 pr-4 py-2 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="p-8 text-center text-capo-ink-soft">Memuat data penggajian...</div>
            ) : penggajianList.length === 0 ? (
              <div className="text-center p-8 text-capo-ink-soft bg-capo-bg m-4 rounded border border-dashed border-capo-line">
                Belum ada data penggajian. Silakan klik "Hitung & Generate Gaji".
              </div>
            ) : (
              <table className="w-full text-[12.5px] text-left border-collapse">
                <thead>
                  <tr className="bg-capo-line/10 text-capo-ink-soft border-b border-capo-line">
                    <th className="px-4 py-3 font-medium">PERIODE</th>
                    <th className="px-4 py-3 font-medium">KARYAWAN</th>
                    <th className="px-4 py-3 font-medium">TIPE GAJI</th>
                    <th className="px-4 py-3 font-medium text-right">TOTAL UPAH</th>
                    <th className="px-4 py-3 font-medium text-center">STATUS</th>
                    <th className="px-4 py-3 font-medium text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-capo-line/50">
                  {penggajianList.map((gaji) => (
                    <tr key={gaji.id} className="hover:bg-black/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-capo-ink">
                        {gaji.periodeBulan}/{gaji.periodeTahun}
                      </td>
                      <td className="px-4 py-3 font-medium text-capo-ink">{gaji.user?.nama}</td>
                      <td className="px-4 py-3">
                        <Badge variant={gaji.tipeGaji === 'BORONGAN' ? 'warning' : 'default'}>
                          {gaji.tipeGaji}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-capo-accent">
                        Rp {Number(gaji.totalUpahBersih).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={gaji.status === 'DIBAYAR' ? 'success' : gaji.status === 'DRAFT' ? 'default' : 'warning'}>
                          {gaji.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]">
                          <Download className="w-3 h-3 mr-1" /> Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <Modal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setGenerateModalOpen(false)}
        title="Generate Gaji Karyawan"
        footer={
          <>
            <Button variant="outline" onClick={() => setGenerateModalOpen(false)}>Batal</Button>
            <Button onClick={handleGenerate} disabled={isSubmitting}>
              {isSubmitting ? 'Menghitung...' : 'Generate Gaji'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[12.5px] text-capo-ink-soft mb-2">
            Sistem akan menghitung otomatis upah berdasarkan tipe gaji karyawan (Harian, Bulanan, atau Borongan berdasarkan klaim yang di-approve).
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-1.5 block">Bulan</label>
              <select 
                className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line focus:ring-1 focus:ring-capo-navy"
                value={generateBulan}
                onChange={(e) => setGenerateBulan(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>Bulan {i+1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-1.5 block">Tahun</label>
              <input 
                type="number" 
                value={generateTahun}
                onChange={(e) => setGenerateTahun(Number(e.target.value))}
                className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line focus:ring-1 focus:ring-capo-navy"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-1.5 block">ID Karyawan</label>
            <input 
              type="text" 
              placeholder="Masukkan ID Karyawan (Misal: 1)" 
              value={generateUserId}
              onChange={(e) => setGenerateUserId(e.target.value)}
              className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line focus:ring-1 focus:ring-capo-navy" 
            />
            <p className="text-[10px] text-capo-ink-soft mt-1">Catatan: Fitur bulk generate bisa diimplementasikan ke depannya.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
