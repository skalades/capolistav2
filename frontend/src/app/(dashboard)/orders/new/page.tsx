"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { CurrencyInput } from "@/components/ui/CurrencyInput"
import { ArrowLeft, Save, Upload } from "lucide-react"

export default function NewOrderPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    namaCustomer: "",
    kontakCustomer: "",
    alamatCustomer: "",
    jenisProduk: "",
    deadline: "",
    totalHarga: 0,
    dp: 0,
  })

  const [sizes, setSizes] = useState({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Siapkan array items dari sizes
    const items = []
    for (const [ukuran, jumlahPcs] of Object.entries(sizes)) {
      if (jumlahPcs > 0) {
        items.push({
          jenisProduk: formData.jenisProduk || "Kaus",
          ukuran,
          jumlahPcs: Number(jumlahPcs)
        })
      }
    }

    const payload = {
      ...formData,
      totalHarga: Number(formData.totalHarga),
      dp: Number(formData.dp),
      items
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        router.push("/orders")
      } else {
        const errorData = await response.json()
        alert(`Gagal menyimpan: ${errorData.message}`)
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-capo-bg">
      <Topbar title="Input Order Baru" />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" /> {isSubmitting ? "Menyimpan..." : "Simpan Order"}
              </Button>
            </div>

            {/* Kustomer Section */}
            <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
              <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DATA KUSTOMER</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Nama Kustomer / Instansi</label>
                  <input type="text" required value={formData.namaCustomer} onChange={(e) => setFormData({...formData, namaCustomer: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" placeholder="Mis. Universitas Brawijaya" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Nomor Kontak (WA)</label>
                  <input type="text" value={formData.kontakCustomer} onChange={(e) => setFormData({...formData, kontakCustomer: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" placeholder="08123456789" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Alamat Pengiriman</label>
                  <textarea rows={3} value={formData.alamatCustomer} onChange={(e) => setFormData({...formData, alamatCustomer: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" placeholder="Alamat lengkap kustomer..."></textarea>
                </div>
              </div>
            </section>

            {/* Produk Section */}
            <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
              <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DETAIL PRODUK & UKURAN</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Jenis Produk</label>
                  <select required value={formData.jenisProduk} onChange={(e) => setFormData({...formData, jenisProduk: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50">
                    <option value="">Pilih Jenis Produk...</option>
                    <option value="Kaus Sablon">Kaus Sablon</option>
                    <option value="Kemeja / PDL">Kemeja / PDL</option>
                    <option value="Jaket">Jaket</option>
                    <option value="Celana">Celana</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Batas Waktu (Deadline)</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-capo-line/50">
                <label className="block text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-3">Rincian Ukuran (Pcs)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(sizes).map(([sz, val]) => (
                    <div key={sz} className="flex items-center space-x-2">
                      <span className="w-8 font-mono text-[13px] font-semibold text-capo-ink">{sz}</span>
                      <input type="number" min="0" value={val} onChange={(e) => setSizes({...sizes, [sz]: e.target.value})} className="w-full p-2 text-[12.5px] text-center rounded-md border border-capo-line bg-white font-mono focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pembayaran & Desain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
                <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">PEMBAYARAN</h2>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Total Harga (Rp)</label>
                    <CurrencyInput required value={formData.totalHarga} onChange={(val) => setFormData({...formData, totalHarga: val})} className="w-full p-2.5 text-[14px] font-mono rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" placeholder="0" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Uang Muka / DP (Rp)</label>
                    <CurrencyInput required value={formData.dp} onChange={(val) => setFormData({...formData, dp: val})} className="w-full p-2.5 text-[14px] font-mono rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" placeholder="0" />
                  </div>
                </div>
              </section>

              <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
                <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DESAIN & LAMPIRAN</h2>
                <div className="border-2 border-dashed border-capo-line rounded-md p-8 flex flex-col items-center justify-center text-center bg-white/50 hover:bg-white transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-capo-ink-soft mb-2" />
                  <p className="text-[12.5px] font-medium text-capo-ink">Klik untuk unggah file desain</p>
                  <p className="text-[11px] text-capo-ink-soft mt-1">Sistem Upload dinonaktifkan sementara</p>
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
