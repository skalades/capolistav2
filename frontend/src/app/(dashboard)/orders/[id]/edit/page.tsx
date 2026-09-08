"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { CurrencyInput } from "@/components/ui/CurrencyInput"
import { ArrowLeft, Save, Upload } from "lucide-react"

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    namaCustomer: "",
    kontakCustomer: "",
    alamatCustomer: "",
    jenisProduk: "",
    deadline: "",
    hargaSatuan: 0,
    totalHarga: 0,
    dp: 0,
    catatan: ""
  })
  
  const [sizes, setSizes] = React.useState<Record<string, number | string>>({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 })

  const handleHargaSatuanChange = (val: string | number) => {
    const num = Number(val) || 0
    const totalPcs = Object.values(sizes).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
    setFormData(prev => ({ ...prev, hargaSatuan: num, totalHarga: totalPcs * num }))
  }

  const handleSizeChange = (sz: string, val: string) => {
    const newSizes = { ...sizes, [sz]: val }
    setSizes(newSizes)
    const totalPcs = Object.values(newSizes).reduce((acc, curr) => acc + (Number(curr) || 0), 0)
    setFormData(prev => ({ ...prev, totalHarga: totalPcs * prev.hargaSatuan }))
  }

  React.useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders/${orderId}`)
        if (res.ok) {
          const data = await res.json()
          
          // Parse deadline for date input
          const deadlineDate = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : ""
          
          setFormData({
            namaCustomer: data.customer?.nama || "",
            kontakCustomer: data.customer?.kontak || "",
            alamatCustomer: data.customer?.alamat || "",
            jenisProduk: data.items?.[0]?.jenisProduk || "Kaus Sablon",
            deadline: deadlineDate,
            totalHarga: Number(data.totalHarga) || 0,
            dp: Number(data.dp) || 0,
            catatan: ""
          })
          
          if (data.items && data.items.length > 0) {
            let totalPcs = 0
            const newSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 } as Record<string, number>
            data.items.forEach((item: any) => {
              if (item.ukuran in newSizes) {
                newSizes[item.ukuran] = Number(item.jumlahPcs)
                totalPcs += Number(item.jumlahPcs)
              }
            })
            setSizes(newSizes)
            
            // Auto calculate harga satuan based on totalHarga and totalPcs
            const parsedTotal = Number(data.totalHarga) || 0
            if (totalPcs > 0 && parsedTotal > 0) {
              setFormData(prev => ({ ...prev, hargaSatuan: Math.round(parsedTotal / totalPcs) }))
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch order", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // NOTE: Backend Patch currently only updates basic Order fields, not nested items/customer
      const payload = {
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        totalHarga: Number(formData.totalHarga),
        dp: Number(formData.dp),
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        alert("Perubahan order berhasil disimpan!")
        router.push(`/orders/${orderId}`)
      } else {
        alert("Gagal menyimpan perubahan.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-capo-bg">
        <Topbar title={`Edit Order - ${orderId}`} />
        <main className="flex-1 p-6 flex justify-center items-center text-capo-ink-soft">
          Loading data pesanan...
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-capo-bg">
      <Topbar title={`Edit Order - ${orderId}`} />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>

            {/* Kustomer Section */}
            <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
              <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DATA KUSTOMER</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Nama Kustomer / Instansi</label>
                  <input type="text" value={formData.namaCustomer} onChange={e => setFormData({...formData, namaCustomer: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Nomor Kontak (WA)</label>
                  <input type="text" value={formData.kontakCustomer} onChange={e => setFormData({...formData, kontakCustomer: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Alamat Pengiriman</label>
                  <textarea rows={3} value={formData.alamatCustomer} onChange={e => setFormData({...formData, alamatCustomer: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </div>
            </section>

            {/* Produk Section */}
            <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
              <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DETAIL PRODUK & UKURAN</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Jenis Produk</label>
                  <select value={formData.jenisProduk} onChange={e => setFormData({...formData, jenisProduk: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50">
                    <option value="">Pilih Jenis Produk...</option>
                    <option value="Kaus Sablon">Kaus Sablon</option>
                    <option value="Kemeja / PDL">Kemeja / PDL</option>
                    <option value="Jaket">Jaket</option>
                    <option value="Celana">Celana</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Batas Waktu (Deadline)</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-capo-line/50">
                <label className="block text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-3">Rincian Ukuran</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(sizes).map(([sz, val]) => (
                    <div key={sz} className="flex items-center space-x-2">
                      <span className="w-8 font-mono text-[13px] font-semibold text-capo-ink">{sz}</span>
                      <input type="number" min="0" value={val} onChange={(e) => handleSizeChange(sz, e.target.value)} className="w-full p-2 text-[12.5px] text-center rounded-md border border-capo-line bg-white font-mono focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
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
                    <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Harga Satuan (Rp)</label>
                    <CurrencyInput value={formData.hargaSatuan} onChange={handleHargaSatuanChange} className="w-full p-2.5 text-[14px] font-mono rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Total Harga (Rp)</label>
                    <CurrencyInput value={formData.totalHarga} onChange={(val) => setFormData({...formData, totalHarga: Number(val)})} className="w-full p-2.5 text-[14px] font-mono rounded-md border-capo-line bg-gray-50 focus:outline-none" />
                    <p className="text-[10px] text-capo-ink-soft">Dihitung otomatis dari Jumlah Pcs x Harga Satuan (Bisa diubah manual)</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Uang Muka / DP (Rp)</label>
                    <CurrencyInput value={formData.dp} onChange={(val) => setFormData({...formData, dp: Number(val)})} className="w-full p-2.5 text-[14px] font-mono rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                  </div>
                </div>
              </section>

              <section className="bg-capo-panel border border-capo-line rounded-panel p-5 space-y-4">
                <h2 className="font-oswald text-lg font-semibold text-capo-ink border-b border-capo-line pb-2">DESAIN & LAMPIRAN</h2>
                <div className="border-2 border-dashed border-capo-line rounded-md p-8 flex flex-col items-center justify-center text-center bg-white/50 hover:bg-white transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-capo-ink-soft mb-2" />
                  <p className="text-[12.5px] font-medium text-capo-ink">Logo_BEM_v2.png</p>
                  <p className="text-[11px] text-capo-ink-soft mt-1">Sistem ganti file sedang dinonaktifkan</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider">Catatan Tambahan</label>
                  <textarea rows={2} value={formData.catatan} onChange={e => setFormData({...formData, catatan: e.target.value})} placeholder="Catatan opsional..." className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" />
                </div>
              </section>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
