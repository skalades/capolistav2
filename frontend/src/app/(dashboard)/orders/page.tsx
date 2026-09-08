"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Topbar } from "@/components/layout/Topbar"
import { KpiCard } from "@/components/ui/KpiCard"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { Search, Plus, PackageOpen } from "lucide-react"

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch("http://localhost:3000/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err)
        setLoading(false)
      })
  }, [])

  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === "ALL" || o.statusProduksi === filterStatus;
    const matchSearch = o.noOrder.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const lateOrdersCount = orders.filter(o => {
    if (o.statusProduksi === "SELESAI" || !o.deadline) return false;
    return new Date(o.deadline) < new Date();
  }).length;

  return (
    <div className="flex flex-col min-h-screen bg-capo-bg">
      <Topbar title="Manajemen Order" />
      
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard 
            title="Total Order Aktif" 
            value={orders.length} 
            caption="Sedang dalam sistem"
            status="success"
          />
          <KpiCard 
            title="Menunggu DP" 
            value={orders.filter(o => o.statusPembayaran !== 'Lunas').length} 
            caption="Order butuh pelunasan"
            status="warning"
          />
          <KpiCard 
            title="Telat Deadline" 
            value={lateOrdersCount} 
            caption="Melewati batas waktu pengiriman"
            status="danger"
          />
        </div>

        <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden">
          <div className="p-4 border-b border-capo-line flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="font-oswald text-lg font-semibold text-capo-ink">DAFTAR ORDER</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex w-full sm:w-auto items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-capo-ink-soft" />
                  <input 
                    type="text" 
                    placeholder="Cari ID atau Kustomer..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50"
                  />
                </div>
                
                <select 
                  className="p-2 text-[12.5px] rounded-md border border-capo-line bg-white focus:outline-none focus:ring-2 focus:ring-capo-accent/50"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="DESAIN">Desain</option>
                  <option value="CETAK">Cetak</option>
                  <option value="CUTTING">Cutting</option>
                  <option value="JAHIT">Jahit</option>
                  <option value="SELESAI">Selesai</option>
                </select>
              </div>

              <Link href="/orders/new" className="w-full sm:w-auto">
                <Button size="sm" className="w-full whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-1" /> Order Baru
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="p-8 text-center text-capo-ink-soft">Memuat data order...</div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState 
                icon={PackageOpen}
                title="Tidak Ada Order"
                description={filterStatus === "ALL" ? "Belum ada order yang masuk ke sistem." : "Tidak ada order dengan status tersebut."}
                action={
                  <Link href="/orders/new">
                    <Button size="sm">Buat Order Baru</Button>
                  </Link>
                }
              />
            ) : (
              <table className="w-full text-[12.5px] text-left border-collapse">
                <thead>
                  <tr className="bg-capo-line/10 text-capo-ink-soft border-b border-capo-line">
                    <th className="px-4 py-3 font-medium">ID ORDER</th>
                    <th className="px-4 py-3 font-medium">KUSTOMER</th>
                    <th className="px-4 py-3 font-medium">STATUS PRODUKSI</th>
                    <th className="px-4 py-3 font-medium">DEADLINE</th>
                    <th className="px-4 py-3 font-medium">PEMBAYARAN</th>
                    <th className="px-4 py-3 font-medium text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-capo-line/50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-black/5 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-capo-ink">
                        <Link href={`/orders/${order.id}`} className="hover:underline text-capo-navy">{order.noOrder}</Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-capo-ink">{order.customerName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={order.statusProduksi === 'SELESAI' ? 'success' : order.statusProduksi === 'DRAFT' ? 'default' : 'warning'}>
                          {order.statusProduksi}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-capo-ink-soft">{order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={order.statusColor === 'Teal' ? 'success' : order.statusColor === 'Gold' ? 'warning' : 'danger'}>
                          {order.statusPembayaran}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2 text-[11px]">Detail</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
