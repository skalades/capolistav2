'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function KeuanganPage() {
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPiutang: 0,
    totalPengeluaran: 0,
    totalOrderMenungguDp: 0,
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [sumRes, payRes] = await Promise.all([
          fetch('http://localhost:3001/finance/summary'),
          fetch('http://localhost:3001/finance/payments')
        ]);
        
        if (sumRes.ok) {
          setSummary(await sumRes.json());
        }
        if (payRes.ok) {
          setPayments(await payRes.json());
        }
      } catch (error) {
        console.error('Error fetching finance data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-capo-bg">
      <Topbar title="Dashboard Keuangan" />
      
      <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8 text-capo-ink-soft">Loading data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard 
                title="Pemasukan (Total)" 
                value={formatRupiah(summary.totalPemasukan)} 
                status="success"
              />
              <KpiCard 
                title="Piutang (Belum Lunas)" 
                value={formatRupiah(summary.totalPiutang)} 
                status="warning"
              />
              <KpiCard 
                title="Pengeluaran (Gaji + PO)" 
                value={formatRupiah(summary.totalPengeluaran)} 
                status="danger"
              />
              <KpiCard 
                title="Menunggu DP" 
                value={summary.totalOrderMenungguDp} 
                caption="Order belum dibayar DP"
                status="default"
              />
            </div>

            <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden">
              <div className="p-4 border-b border-capo-line flex justify-between items-center">
                <h3 className="font-oswald text-[18px] text-capo-ink font-medium">Daftar Transaksi Pembayaran</h3>
                <Button variant="primary" size="sm">Tambah Pembayaran</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px] md:text-[13px] text-capo-ink">
                  <thead className="bg-capo-surface text-capo-ink-soft uppercase text-[10.5px] md:text-[11px] font-medium tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border-b border-capo-line">Tanggal</th>
                      <th className="px-4 py-3 border-b border-capo-line">No. Order</th>
                      <th className="px-4 py-3 border-b border-capo-line">Pelanggan</th>
                      <th className="px-4 py-3 border-b border-capo-line">Metode</th>
                      <th className="px-4 py-3 border-b border-capo-line">Jumlah</th>
                      <th className="px-4 py-3 border-b border-capo-line text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-capo-line">
                    {payments.length > 0 ? (
                      payments.map((pay: any) => (
                        <tr key={pay.id} className="hover:bg-capo-surface/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">{formatDate(pay.tanggalBayar)}</td>
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{pay.order?.noOrder || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{pay.order?.customer?.nama || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant={pay.metodePembayaran === 'TRANSFER' ? 'primary' : 'default'}>
                              {pay.metodePembayaran}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-capo-accent">
                            {formatRupiah(Number(pay.jumlah))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button variant="outline" size="sm">Detail</Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-capo-ink-soft">
                          Belum ada data pembayaran
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
