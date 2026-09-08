"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Save, Upload } from "lucide-react"

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  return (
    <div className="flex flex-col min-h-screen bg-capo-bg">
      <Topbar title={`Edit Order - ${orderId}`} />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" /> Simpan Perubahan
            </Button>
          </div>

          <form className="space-y-6">
            {/* Kustomer Section */}
            <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
              <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DATA KUSTOMER</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Nama Kustomer / Instansi</label>
                  <input type="text" defaultValue="Universitas Brawijaya (BEM)" className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Nomor Kontak (WA)</label>
                  <input type="text" defaultValue="0812-3456-7890" className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Alamat Pengiriman</label>
                  <textarea rows={3} defaultValue="Jl. Veteran, Ketawanggede, Malang" className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </div>
            </section>

            {/* Produk Section */}
            <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
              <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DETAIL PRODUK & UKURAN</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Jenis Produk</label>
                  <select defaultValue="kaus" className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50">
                    <option value="">Pilih Jenis Produk...</option>
                    <option value="kaus">Kaus Sablon</option>
                    <option value="kemeja">Kemeja / PDL</option>
                    <option value="jaket">Jaket</option>
                    <option value="celana">Celana</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Batas Waktu (Deadline)</label>
                  <input type="date" defaultValue="2026-09-15" className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-capo-line/50">
                <label className="block text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-3">Rincian Ukuran</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { size: 'S', val: 10 }, 
                    { size: 'M', val: 30 }, 
                    { size: 'L', val: 40 }, 
                    { size: 'XL', val: 30 }, 
                    { size: 'XXL', val: 10 }
                  ].map((item) => (
                    <div key={item.size} className="flex items-center space-x-2">
                      <span className="w-8 font-mono text-[13px] font-semibold text-capo-ink">{item.size}</span>
                      <input type="number" min="0" defaultValue={item.val} className="w-full p-2 text-[12.5px] text-center rounded-md border border-capo-line bg-white font-mono focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
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
                    <input type="text" defaultValue="9.600.000" className="w-full p-2.5 text-[14px] font-mono rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Uang Muka / DP (Rp)</label>
                    <input type="text" defaultValue="5.000.000" className="w-full p-2.5 text-[14px] font-mono rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                  </div>
                </div>
              </section>

              <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
                <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DESAIN & LAMPIRAN</h2>
                <div className="border-2 border-dashed border-capo-line rounded-md p-8 flex flex-col items-center justify-center text-center bg-white/50 hover:bg-white transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-capo-ink-soft mb-2" />
                  <p className="text-[12.5px] font-medium text-capo-ink">Logo_BEM_v2.png</p>
                  <p className="text-[11px] text-capo-ink-soft mt-1">Klik untuk mengganti file</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Catatan Tambahan</label>
                  <textarea rows={2} defaultValue="Sablon plastisol warna kuning emas" className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
