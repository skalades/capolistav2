'use client';

import React, { useState } from 'react';
import { Search, Package, MapPin, Calendar } from 'lucide-react';
import TimelineItem from '@/components/tracking/TimelineItem';

interface OrderTrackingData {
  noOrder: string;
  customer: {
    nama: string;
  };
  tanggalOrder: string;
  deadline: string | null;
  status: string;
  items: Array<{
    id: number;
    jenisProduk: string;
    ukuran: string;
    jumlahPcs: number;
  }>;
  logs: Array<{
    id: number;
    type: string;
    title: string;
    desc: string;
    createdAt: string;
  }>;
}

export default function TrackOrderPage() {
  const [noOrder, setNoOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noOrder.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/orders/track/${noOrder.trim()}`);
      
      if (!res.ok) {
        if (res.status === 404 || res.status === 400) {
          throw new Error('Pesanan tidak ditemukan. Periksa kembali ID Order Anda.');
        }
        throw new Error('Terjadi kesalahan pada server.');
      }

      const data = await res.json();
      setOrderData(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-capo-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-oswald text-capo-ink font-bold mb-4">Lacak Pesanan Anda</h1>
          <p className="text-capo-ink-soft">Masukkan ID Order Anda (contoh: ORD-20231015-0001) untuk melihat status pesanan saat ini.</p>
        </div>

        {/* Search Box */}
        <div className="bg-capo-panel border border-capo-line rounded-[var(--radius-panel)] p-6 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-capo-ink-soft" />
              </div>
              <input
                type="text"
                value={noOrder}
                onChange={(e) => setNoOrder(e.target.value)}
                placeholder="Masukkan ID Order (Misal: ORD-...)"
                className="block w-full pl-10 pr-3 py-3 border border-capo-line rounded-[var(--radius-panel)] bg-capo-bg text-capo-ink focus:outline-none focus:ring-2 focus:ring-capo-accent sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !noOrder.trim()}
              className="px-6 py-3 bg-capo-navy text-white font-medium rounded-[var(--radius-panel)] hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Mencari...' : 'Lacak Pesanan'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-capo-danger text-capo-danger rounded-[var(--radius-panel)]">
              {error}
            </div>
          )}
        </div>

        {/* Result View */}
        {orderData && (
          <div className="bg-capo-panel border border-capo-line rounded-[var(--radius-panel)] overflow-hidden shadow-sm">
            {/* Header / Summary */}
            <div className="p-6 border-b border-capo-line bg-[#f8f6f0]">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-oswald text-capo-ink font-bold">{orderData.noOrder}</h2>
                  <p className="text-capo-ink-soft text-sm mt-1">Pemesan: <span className="font-medium text-capo-ink">{orderData.customer.nama}</span></p>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-[var(--radius-badge)] text-sm font-medium bg-capo-accent text-white">
                    Status: {orderData.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6">
                <div className="flex items-center gap-2 text-capo-ink-soft">
                  <Calendar className="w-4 h-4" />
                  <span>Tgl Pesan: {new Date(orderData.tanggalOrder).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-2 text-capo-ink-soft">
                  <MapPin className="w-4 h-4" />
                  <span>Deadline: {orderData.deadline ? new Date(orderData.deadline).toLocaleDateString('id-ID') : '-'}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-6 border-b border-capo-line">
              <h3 className="font-oswald text-lg text-capo-ink mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" /> Detail Produk
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-capo-line text-sm">
                  <thead>
                    <tr className="text-left text-capo-ink-soft">
                      <th className="pb-2 font-medium">Jenis Produk</th>
                      <th className="pb-2 font-medium text-center">Ukuran</th>
                      <th className="pb-2 font-medium text-right">Jumlah (Pcs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-capo-line">
                    {orderData.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-capo-ink">{item.jenisProduk}</td>
                        <td className="py-3 text-capo-ink text-center">{item.ukuran}</td>
                        <td className="py-3 text-capo-ink text-right font-mono">{item.jumlahPcs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h3 className="font-oswald text-lg text-capo-ink mb-6">Riwayat Status</h3>
              <div className="pl-2">
                {orderData.logs.length > 0 ? (
                  orderData.logs.map((log, index) => (
                    <TimelineItem 
                      key={log.id} 
                      log={log} 
                      isLast={index === orderData.logs.length - 1} 
                    />
                  ))
                ) : (
                  <p className="text-capo-ink-soft text-sm">Belum ada riwayat untuk pesanan ini.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
