'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { API } from '@/lib/api';

export default function KeuanganPage() {
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPiutang: 0,
    totalPengeluaran: 0,
    totalOrderMenungguDp: 0,
  });
  const [payments, setPayments] = useState([]);
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Pengeluaran
  const [showFormPengeluaran, setShowFormPengeluaran] = useState(false);
  const [newPengeluaran, setNewPengeluaran] = useState({
    keterangan: '',
    kategori: 'Umum',
    jumlah: 0,
    tanggal: new Date().toISOString().split('T')[0]
  });

  const fetchFinanceData = async () => {
    try {
      const [sumRes, payRes, outRes] = await Promise.all([
        fetch(`${API}/finance/summary`),
        fetch(`${API}/finance/payments`),
        fetch(`${API}/finance/pengeluaran`),
      ]);
      
      if (sumRes.ok) setSummary(await sumRes.json());
      if (payRes.ok) setPayments(await payRes.json());
      if (outRes.ok) setPengeluaran(await outRes.json());
    } catch (error) {
      console.error('Error fetching finance data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleAddPengeluaran = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/finance/pengeluaran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPengeluaran)
      });
      if (res.ok) {
        setNewPengeluaran({ keterangan: '', kategori: 'Umum', jumlah: 0, tanggal: new Date().toISOString().split('T')[0] });
        setShowFormPengeluaran(false);
        fetchFinanceData();
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const getJenisPembayaran = (pay: any) => {
    if (!pay.order) return 'DP';
    if (Number(pay.jumlah) >= Number(pay.order.totalHarga)) return 'LUNAS (FULL)';
    if (Number(pay.jumlah) <= Number(pay.order.dp) || Number(pay.order.dp) === 0) return 'DP';
    return 'PELUNASAN';
  };

  const getBadgeVariant = (jenis: string) => {
    if (jenis.includes('DP')) return 'warning';
    if (jenis.includes('LUNAS') || jenis.includes('PELUNASAN')) return 'success';
    return 'default';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-capo-bg">
      <Topbar title="Dashboard Keuangan & Akuntansi" context="Pantau arus kas, pembayaran order, dan pengeluaran" />
      
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
                actionLabel="Lihat Pemasukan"
                actionHref="#tabel-transaksi"
              />
              <KpiCard 
                title="Piutang (Belum Lunas)" 
                value={formatRupiah(summary.totalPiutang)} 
                status="warning"
                actionLabel="Lihat Detail Piutang"
                actionHref="/orders"
              />
              <KpiCard 
                title="Pengeluaran (Total)" 
                value={formatRupiah(summary.totalPengeluaran)} 
                status="danger"
                actionLabel="Lihat Detail Biaya"
                actionHref="#tabel-pengeluaran"
              />
              <KpiCard 
                title="Menunggu DP" 
                value={summary.totalOrderMenungguDp} 
                caption="Order belum dibayar DP"
                status="default"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-capo-panel border border-capo-line rounded-panel p-5">
                <h3 className="font-oswald text-[16px] text-capo-ink font-medium mb-4">Grafik Arus Kas (Bulan Ini)</h3>
                <div className="flex items-end gap-6 h-40 mt-6 border-b border-capo-line pb-2 px-2 relative">
                  <div className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="w-full max-w-[80px] bg-capo-accent/80 hover:bg-capo-accent transition-all rounded-t-sm" style={{ height: summary.totalPemasukan > 0 ? '90%' : '10%' }}></div>
                    <span className="text-[11px] text-capo-ink-soft mt-2">Pemasukan</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="w-full max-w-[80px] bg-capo-danger/80 hover:bg-capo-danger transition-all rounded-t-sm" style={{ height: summary.totalPengeluaran > 0 ? '60%' : '5%' }}></div>
                    <span className="text-[11px] text-capo-ink-soft mt-2">Pengeluaran</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="w-full max-w-[80px] bg-capo-ink/80 hover:bg-capo-ink transition-all rounded-t-sm" style={{ height: summary.totalPemasukan - summary.totalPengeluaran > 0 ? '50%' : '5%' }}></div>
                    <span className="text-[11px] text-capo-ink-soft mt-2">Laba Bersih</span>
                  </div>
                </div>
              </div>

              <div className="bg-capo-panel border border-capo-line rounded-panel p-5">
                <h3 className="font-oswald text-[16px] text-capo-ink font-medium mb-4">Ringkasan Laba Rugi</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-capo-line/50 pb-2">
                    <span className="text-[12px] text-capo-ink-soft">Total Omzet</span>
                    <span className="text-[13px] font-semibold text-capo-ink">{formatRupiah(summary.totalPemasukan + summary.totalPiutang)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-capo-line/50 pb-2">
                    <span className="text-[12px] text-capo-ink-soft">Kas Masuk</span>
                    <span className="text-[13px] font-semibold text-capo-accent">{formatRupiah(summary.totalPemasukan)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-capo-line/50 pb-2">
                    <span className="text-[12px] text-capo-ink-soft">Kas Keluar</span>
                    <span className="text-[13px] font-semibold text-capo-danger">-{formatRupiah(summary.totalPengeluaran)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[13px] font-bold text-capo-ink">Laba Bersih</span>
                    <span className="text-[15px] font-bold text-capo-ink">{formatRupiah(summary.totalPemasukan - summary.totalPengeluaran)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Container */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Pembayaran Table */}
              <div id="tabel-transaksi" className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden scroll-mt-6 flex flex-col">
                <div className="p-4 border-b border-capo-line flex justify-between items-center bg-capo-surface/30">
                  <h3 className="font-oswald text-[18px] text-capo-ink font-medium">Uang Masuk (Pembayaran)</h3>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[12px] md:text-[13px] text-capo-ink">
                    <thead className="bg-capo-surface text-capo-ink-soft uppercase text-[10.5px] font-medium tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-capo-line">Tgl</th>
                        <th className="px-4 py-3 border-b border-capo-line">Order</th>
                        <th className="px-4 py-3 border-b border-capo-line">Pelanggan</th>
                        <th className="px-4 py-3 border-b border-capo-line">Jenis</th>
                        <th className="px-4 py-3 border-b border-capo-line text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-capo-line">
                      {payments.length > 0 ? (
                        payments.map((pay: any) => (
                          <tr key={pay.id} className="hover:bg-capo-surface/50">
                            <td className="px-4 py-3">{formatDate(pay.tanggalBayar)}</td>
                            <td className="px-4 py-3 font-mono font-medium">{pay.order?.noOrder?.split('-').pop() || '-'}</td>
                            <td className="px-4 py-3">{pay.order?.customer?.nama || '-'}</td>
                            <td className="px-4 py-3"><Badge variant={getBadgeVariant(getJenisPembayaran(pay))}>{getJenisPembayaran(pay)}</Badge></td>
                            <td className="px-4 py-3 font-medium text-capo-accent font-mono text-right">{formatRupiah(Number(pay.jumlah))}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-capo-ink-soft">Belum ada uang masuk</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pengeluaran Table */}
              <div id="tabel-pengeluaran" className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden scroll-mt-6 flex flex-col">
                <div className="p-4 border-b border-capo-line flex justify-between items-center bg-capo-surface/30">
                  <h3 className="font-oswald text-[18px] text-capo-ink font-medium">Uang Keluar (Operasional)</h3>
                  <Button variant="primary" size="sm" onClick={() => setShowFormPengeluaran(!showFormPengeluaran)}>
                    {showFormPengeluaran ? 'Batal' : 'Catat Pengeluaran'}
                  </Button>
                </div>
                
                {showFormPengeluaran && (
                  <div className="p-4 bg-capo-surface/20 border-b border-capo-line">
                    <form onSubmit={handleAddPengeluaran} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10.5px] uppercase text-capo-ink-soft font-medium">Keterangan</label>
                          <input type="text" required value={newPengeluaran.keterangan} onChange={e => setNewPengeluaran({...newPengeluaran, keterangan: e.target.value})} className="w-full mt-1 p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy" placeholder="Mis. Beli Token Listrik" />
                        </div>
                        <div>
                          <label className="text-[10.5px] uppercase text-capo-ink-soft font-medium">Kategori</label>
                          <select value={newPengeluaran.kategori} onChange={e => setNewPengeluaran({...newPengeluaran, kategori: e.target.value})} className="w-full mt-1 p-2 text-[12px] border border-capo-line rounded bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy">
                            <option value="Umum">Umum</option>
                            <option value="Listrik">Listrik & Air</option>
                            <option value="Konsumsi">Konsumsi</option>
                            <option value="Transport">Bensin/Transport</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10.5px] uppercase text-capo-ink-soft font-medium">Nominal</label>
                          <CurrencyInput required value={newPengeluaran.jumlah} onChange={val => setNewPengeluaran({...newPengeluaran, jumlah: Number(val)})} className="w-full mt-1 p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy" />
                        </div>
                        <div>
                          <label className="text-[10.5px] uppercase text-capo-ink-soft font-medium">Tanggal</label>
                          <input type="date" required value={newPengeluaran.tanggal} onChange={e => setNewPengeluaran({...newPengeluaran, tanggal: e.target.value})} className="w-full mt-1 p-2 text-[12px] border border-capo-line rounded focus:outline-none focus:ring-1 focus:ring-capo-navy" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" size="sm">Simpan</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[12px] md:text-[13px] text-capo-ink">
                    <thead className="bg-capo-surface text-capo-ink-soft uppercase text-[10.5px] font-medium tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-capo-line">Tgl</th>
                        <th className="px-4 py-3 border-b border-capo-line">Keterangan</th>
                        <th className="px-4 py-3 border-b border-capo-line">Kategori</th>
                        <th className="px-4 py-3 border-b border-capo-line text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-capo-line">
                      {pengeluaran.length > 0 ? (
                        pengeluaran.map((out: any) => (
                          <tr key={out.id} className="hover:bg-capo-surface/50">
                            <td className="px-4 py-3 whitespace-nowrap">{formatDate(out.tanggal)}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{out.keterangan}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant="default">{out.kategori}</Badge>
                            </td>
                            <td className="px-4 py-3 font-medium text-capo-danger font-mono text-right whitespace-nowrap">{formatRupiah(Number(out.jumlah))}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-capo-ink-soft">Belum ada pengeluaran dicatat</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
