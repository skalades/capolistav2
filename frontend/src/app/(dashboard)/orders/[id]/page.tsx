"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Topbar } from "@/components/layout/Topbar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { ArrowLeft, MessageSquare, Printer, CheckCircle2, Clock, Edit } from "lucide-react"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [isStatusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [catatanStatus, setCatatanStatus] = useState("")

  const [chatMessage, setChatMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await fetch(`http://localhost:3000/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setSelectedStatus(data.status)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const handleUpdateStatus = async () => {
    setIsSubmitting(true)
    try {
      await fetch(`http://localhost:3000/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, catatan: catatanStatus })
      })
      setStatusModalOpen(false)
      fetchOrder()
    } catch (err) {
      alert("Gagal update status")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddChat = async () => {
    if (!chatMessage.trim()) return
    setIsSubmitting(true)
    try {
      await fetch(`http://localhost:3000/orders/${order.id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatMessage })
      })
      setChatMessage("")
      fetchOrder()
    } catch (err) {
      alert("Gagal kirim pesan")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Memuat detail order...</div>
  if (!order) return <div className="p-8 text-center text-red-500">Order tidak ditemukan</div>

  const sisaBayar = Number(order.sisaBayar)
  const totalHarga = Number(order.totalHarga)
  const dp = Number(order.dp)

  return (
    <div className="flex flex-col min-h-screen bg-capo-bg">
      <Topbar title={`Detail Order - ${order.noOrder}`} />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <h1 className="font-oswald text-xl font-semibold text-capo-ink flex items-center gap-3">
                {order.noOrder}
                <Badge variant={order.status === 'SELESAI' ? 'success' : order.status === 'DRAFT' ? 'default' : 'warning'}>
                  {order.status}
                </Badge>
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/orders/${order.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </Link>
              <Button size="sm" onClick={() => setStatusModalOpen(true)}>
                Ubah Status
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Card Kustomer & Produk */}
              <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden">
                <div className="p-4 border-b border-capo-line bg-black/5">
                  <h2 className="font-oswald text-lg font-medium text-capo-ink">RINGKASAN ORDER</h2>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-3">Informasi Kustomer</h3>
                    <dl className="space-y-2 text-[12.5px]">
                      <div className="grid grid-cols-3 gap-2"><dt className="text-capo-ink-soft">Nama</dt><dd className="col-span-2 font-medium">{order.customer?.nama}</dd></div>
                      <div className="grid grid-cols-3 gap-2"><dt className="text-capo-ink-soft">Kontak</dt><dd className="col-span-2 font-medium">{order.customer?.kontak || '-'}</dd></div>
                      <div className="grid grid-cols-3 gap-2"><dt className="text-capo-ink-soft">Alamat</dt><dd className="col-span-2">{order.customer?.alamat || '-'}</dd></div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-3">Detail Spesifikasi</h3>
                    <dl className="space-y-2 text-[12.5px]">
                      <div className="grid grid-cols-3 gap-2"><dt className="text-capo-ink-soft">Deadline</dt><dd className="col-span-2 font-medium text-capo-danger">{order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : '-'}</dd></div>
                      <div className="grid grid-cols-3 gap-2"><dt className="text-capo-ink-soft">Total Item</dt><dd className="col-span-2 font-mono">{order.items?.length || 0} varian</dd></div>
                    </dl>
                  </div>
                </div>
                <div className="p-5 border-t border-capo-line bg-white/30">
                  <h3 className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-3">Breakdown Ukuran</h3>
                  <div className="flex flex-wrap gap-4">
                    {order.items?.map((it: any) => (
                      <div key={it.id} className="px-3 py-1.5 bg-white border border-capo-line rounded-md font-mono text-[12px]">
                        {it.jenisProduk} - {it.ukuran}: {it.jumlahPcs}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Keuangan */}
              <div className="bg-capo-panel border border-capo-line rounded-panel p-5">
                <h2 className="font-oswald text-lg font-medium text-capo-ink mb-4">FINANSIAL</h2>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-capo-line rounded-md bg-white">
                  <div className="flex-1 w-full flex justify-between md:block md:space-y-1">
                    <span className="text-[11.5px] text-capo-ink-soft block">Total Harga</span>
                    <span className="font-mono font-medium text-[14px]">Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-px h-10 bg-capo-line hidden md:block" />
                  <div className="flex-1 w-full flex justify-between md:block md:space-y-1">
                    <span className="text-[11.5px] text-capo-ink-soft block">Terbayar (DP)</span>
                    <span className="font-mono font-medium text-[14px] text-capo-success">Rp {dp.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-px h-10 bg-capo-line hidden md:block" />
                  <div className="flex-1 w-full flex justify-between md:block md:space-y-1">
                    <span className="text-[11.5px] text-capo-ink-soft block">Sisa Pembayaran</span>
                    <span className="font-mono font-medium text-[14px] text-capo-danger">Rp {sisaBayar.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Produksi (Timeline) */}
            <div className="bg-capo-panel border border-capo-line rounded-panel flex flex-col h-[600px]">
              <div className="p-4 border-b border-capo-line bg-black/5">
                <h2 className="font-oswald text-lg font-medium text-capo-ink flex items-center gap-2">
                  <Clock className="w-4 h-4 text-capo-ink-soft" /> RIWAYAT PRODUKSI
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="space-y-6">
                  {order.logs?.map((item: any, idx: number) => (
                    <div key={item.id} className="relative pl-6">
                      {idx !== order.logs.length - 1 && (
                        <div className="absolute top-6 left-[11px] bottom-[-24px] w-px bg-capo-line" />
                      )}
                      <div className={`absolute top-1 left-0 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white ${item.type === 'chat' ? 'bg-capo-gold' : 'bg-capo-accent'}`}>
                        {item.type === 'chat' ? <MessageSquare className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>

                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-medium text-[12.5px] text-capo-ink">{item.title}</span>
                        <span className="text-[10px] text-capo-ink-soft whitespace-nowrap">{new Date(item.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      <div className={`p-3 rounded-md text-[12px] ${item.type === 'chat' ? 'bg-capo-gold/10 border border-capo-gold/20' : 'bg-capo-line/20'}`}>
                        <span className="font-semibold block mb-0.5">{item.user?.nama || 'Sistem'}</span>
                        <p className="text-capo-ink-soft leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                  {order.logs?.length === 0 && (
                    <p className="text-[12px] text-capo-ink-soft text-center py-4">Belum ada riwayat.</p>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-capo-line bg-white/50">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChat()}
                    placeholder="Tulis catatan riwayat..." 
                    className="flex-1 p-2 text-[12.5px] rounded-md border border-capo-line focus:outline-none focus:ring-2 focus:ring-capo-accent/50" 
                  />
                  <Button size="sm" onClick={handleAddChat} disabled={isSubmitting}>Kirim</Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setStatusModalOpen(false)}
        title="Ubah Status Produksi"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>Batal</Button>
            <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[12.5px] text-capo-ink-soft mb-2">Pilih tahapan produksi selanjutnya untuk order ini. Aksi ini akan mencatat log ke dalam Riwayat Produksi.</p>
          
          <div className="space-y-2">
            {[
              { id: 'DRAFT', label: 'Draft' },
              { id: 'DESAIN', label: 'Antrean Desain' },
              { id: 'CETAK', label: 'Proses Cetak / Printing' },
              { id: 'CUTTING', label: 'Proses Potong (Cutting)' },
              { id: 'JAHIT', label: 'Proses Jahit' },
              { id: 'SELESAI', label: 'Order Selesai / Siap Diambil' }
            ].map(status => (
              <label key={status.id} className="flex items-center gap-3 p-3 border border-capo-line rounded-md cursor-pointer hover:bg-black/5 transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value={status.id}
                  checked={selectedStatus === status.id}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-4 h-4 text-capo-accent focus:ring-capo-accent"
                />
                <span className="text-[12.5px] font-medium text-capo-ink">{status.label}</span>
              </label>
            ))}
          </div>
          
          <div className="pt-2">
            <label className="text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-1.5 block">Catatan Tambahan (Opsional)</label>
            <textarea 
              rows={2} 
              value={catatanStatus}
              onChange={(e) => setCatatanStatus(e.target.value)}
              className="w-full p-2.5 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50" 
              placeholder="Misal: Sudah di-acc customer..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
