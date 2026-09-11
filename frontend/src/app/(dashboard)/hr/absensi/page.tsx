'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { API, apiFetch } from '@/lib/api';
import { Users, Check, Calendar, Clock, FileText } from 'lucide-react';

type StatusAbsen = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';

interface Karyawan {
  id: number;
  nama: string;
  divisi: string;
  role: string;
}

interface AbsensiEntry {
  status: StatusAbsen;
  jamMasuk: string;
  jamKeluar: string;
  catatan: string;
}

const STATUS_OPTIONS: { value: StatusAbsen; label: string; }[] = [
  { value: 'HADIR', label: 'Hadir' },
  { value: 'IZIN', label: 'Izin' },
  { value: 'SAKIT', label: 'Sakit' },
  { value: 'ALPA', label: 'Alpha' },
];

export default function AbsensiPage() {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.split('-')[1];
  const currentYear = today.split('-')[0];

  const [activeTab, setActiveTab] = useState<'INPUT' | 'REKAP'>('INPUT');
  const [tanggal, setTanggal] = useState(today);
  const [divisiFilter, setDivisiFilter] = useState('');
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [entries, setEntries] = useState<Record<number, AbsensiEntry>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Rekap state
  const [rekapBulan, setRekapBulan] = useState(currentMonth);
  const [rekapTahun, setRekapTahun] = useState(currentYear);
  const [rekapData, setRekapData] = useState<any[]>([]);
  const [loadingRekap, setLoadingRekap] = useState(false);

  const DIVISI_OPTIONS = [
    'PEMASARAN', 'PRODUKSI', 'DESAIN', 'CUTTING', 'JAHIT',
    'PRINTING', 'PEMASANGAN', 'PROCUREMENT', 'GUDANG', 'KEUANGAN', 'HR',
  ];

  const fetchDataHarian = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (divisiFilter) params.set('divisi', divisiFilter);
      
      const [resKar, resAbs] = await Promise.all([
        apiFetch(`/hr/karyawan?${params.toString()}`),
        apiFetch(`/hr/absensi?tanggal=${tanggal}`)
      ]);

      if (resKar.ok && resAbs.ok) {
        const dataKar = await resKar.json();
        const dataAbs = await resAbs.json();
        
        setKaryawanList(dataKar);

        // Buat map dari data yang sudah ada
        const existingMap: Record<number, any> = {};
        dataAbs.forEach((a: any) => {
          existingMap[a.userId] = a;
        });

        // Set state entries
        const newEntries: Record<number, AbsensiEntry> = {};
        dataKar.forEach((k: Karyawan) => {
          const ext = existingMap[k.id];
          newEntries[k.id] = {
            status: ext ? ext.status : 'HADIR',
            jamMasuk: ext?.jamMasuk ? new Date(ext.jamMasuk).toISOString().substr(11, 5) : '',
            jamKeluar: ext?.jamKeluar ? new Date(ext.jamKeluar).toISOString().substr(11, 5) : '',
            catatan: ext?.catatan || '',
          };
        });
        setEntries(newEntries);
      }
    } catch (err) {
      console.error('Gagal fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRekap = async () => {
    setLoadingRekap(true);
    try {
      const res = await apiFetch(`/hr/absensi/rekap?bulan=${rekapBulan}&tahun=${rekapTahun}`);
      if (res.ok) {
        const data = await res.json();
        setRekapData(data);
      }
    } catch (err) {
      console.error('Gagal fetch rekap', err);
    } finally {
      setLoadingRekap(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'INPUT') {
      fetchDataHarian();
    } else {
      fetchRekap();
    }
  }, [divisiFilter, tanggal, activeTab, rekapBulan, rekapTahun]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(entries).map(([userId, val]) => ({
        userId: Number(userId),
        tanggal,
        status: val.status,
        jamMasuk: val.jamMasuk || undefined,
        jamKeluar: val.jamKeluar || undefined,
        catatan: val.catatan || undefined,
      }));

      const res = await apiFetch(`/hr/absensi/bulk`, {
        method: 'POST',
        body: JSON.stringify({ entries: payload }),
      });

      if (res.ok) {
        setSuccessMsg(`Absensi ${tanggal} berhasil disimpan untuk ${payload.length} karyawan.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Gagal simpan absensi', err);
    } finally {
      setSaving(false);
    }
  };

  const updateEntry = (userId: number, field: keyof AbsensiEntry, value: string) => {
    setEntries(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  const setAllStatus = (status: StatusAbsen) => {
    const newEntries = { ...entries };
    Object.keys(newEntries).forEach((id) => {
      newEntries[Number(id)].status = status;
    });
    setEntries(newEntries);
  };

  return (
    <>
      <Topbar
        title="Absensi Karyawan"
        context="Manajemen kehadiran dan rekapitulasi bulanan"
        actions={
          activeTab === 'INPUT' ? (
            <Button variant="accent" onClick={handleSubmit} disabled={saving || karyawanList.length === 0}>
              {saving ? 'Menyimpan...' : 'Simpan Absensi'}
            </Button>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Tabs */}
        <div className="flex border-b border-capo-line mb-4">
          <button
            onClick={() => setActiveTab('INPUT')}
            className={`px-4 py-2 font-medium text-[13px] border-b-2 transition-colors ${
              activeTab === 'INPUT' ? 'border-capo-navy text-capo-navy' : 'border-transparent text-capo-ink-soft hover:text-capo-ink'
            }`}
          >
            Input Harian
          </button>
          <button
            onClick={() => setActiveTab('REKAP')}
            className={`px-4 py-2 font-medium text-[13px] border-b-2 transition-colors ${
              activeTab === 'REKAP' ? 'border-capo-navy text-capo-navy' : 'border-transparent text-capo-ink-soft hover:text-capo-ink'
            }`}
          >
            Rekap Bulanan
          </button>
        </div>

        {successMsg && (
          <div className="bg-capo-accent/10 border border-capo-accent/30 rounded-panel px-4 py-3 text-capo-accent text-[13px] font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {activeTab === 'INPUT' ? (
          <>
            <div className="bg-capo-panel border border-capo-line rounded-panel p-4 flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Tanggal</label>
                <input
                  type="date"
                  value={tanggal}
                  max={today}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="border border-capo-line rounded-panel px-3 py-2 text-[13px] text-capo-ink bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Divisi</label>
                <select
                  value={divisiFilter}
                  onChange={(e) => setDivisiFilter(e.target.value)}
                  className="border border-capo-line rounded-panel px-3 py-2 text-[13px] text-capo-ink bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy min-w-[160px]"
                >
                  <option value="">Semua Divisi</option>
                  {DIVISI_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 ml-auto">
                <span className="text-[11.5px] text-capo-ink-soft self-end mb-2">Set semua:</span>
                <Button variant="secondary" size="sm" onClick={() => setAllStatus('HADIR')}>Hadir</Button>
                <Button variant="secondary" size="sm" onClick={() => setAllStatus('ALPA')}>Alpha</Button>
              </div>
            </div>

            <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-capo-line">
                <h2 className="font-oswald text-[16px] font-semibold text-capo-ink">Daftar Karyawan</h2>
                <span className="text-[11.5px] text-capo-ink-soft">{karyawanList.length} orang</span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-capo-ink-soft text-[13px]">Memuat data absensi...</div>
              ) : karyawanList.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Tidak ada karyawan"
                  description="Ubah filter divisi atau pastikan data karyawan ada."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-capo-line bg-capo-bg/50">
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider w-[200px]">Karyawan</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider w-[260px]">Status</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Jam Masuk / Keluar / Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-capo-line">
                      {karyawanList.map((k) => (
                        <tr key={k.id} className="hover:bg-capo-bg/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-[13px] text-capo-ink">{k.nama}</div>
                            <div className="text-[11px] text-capo-ink-soft mt-0.5">{k.divisi}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {STATUS_OPTIONS.map((opt) => (
                                <button
                                  key={opt.value}
                                  onClick={() => updateEntry(k.id, 'status', opt.value)}
                                  className={`px-2.5 py-1 rounded-badge text-[11px] font-medium transition-colors border ${
                                    entries[k.id]?.status === opt.value
                                      ? opt.value === 'HADIR' ? 'bg-capo-accent text-white border-capo-accent'
                                      : opt.value === 'ALPA' ? 'bg-capo-danger text-white border-capo-danger'
                                      : 'bg-capo-gold text-white border-capo-gold'
                                      : 'bg-transparent text-capo-ink-soft border-capo-line hover:bg-capo-line/20'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {entries[k.id]?.status === 'HADIR' ? (
                              <div className="flex gap-3">
                                <div className="flex items-center gap-1.5 bg-white border border-capo-line rounded px-2 py-1">
                                  <Clock className="w-3.5 h-3.5 text-capo-ink-soft" />
                                  <input 
                                    type="time" 
                                    value={entries[k.id]?.jamMasuk || ''} 
                                    onChange={(e) => updateEntry(k.id, 'jamMasuk', e.target.value)}
                                    className="text-[12px] focus:outline-none w-[70px]"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 bg-white border border-capo-line rounded px-2 py-1">
                                  <Clock className="w-3.5 h-3.5 text-capo-ink-soft" />
                                  <input 
                                    type="time" 
                                    value={entries[k.id]?.jamKeluar || ''} 
                                    onChange={(e) => updateEntry(k.id, 'jamKeluar', e.target.value)}
                                    className="text-[12px] focus:outline-none w-[70px]"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-white border border-capo-line rounded px-2 py-1 w-full max-w-[200px]">
                                <FileText className="w-3.5 h-3.5 text-capo-ink-soft" />
                                <input 
                                  type="text" 
                                  placeholder={entries[k.id]?.status === 'ALPA' ? '-' : `Catatan ${entries[k.id]?.status.toLowerCase()}...`}
                                  value={entries[k.id]?.catatan || ''}
                                  onChange={(e) => updateEntry(k.id, 'catatan', e.target.value)}
                                  className="text-[12px] focus:outline-none w-full"
                                  disabled={entries[k.id]?.status === 'ALPA'}
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Rekap Tab */
          <div className="space-y-4">
            <div className="bg-capo-panel border border-capo-line rounded-panel p-4 flex gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Bulan</label>
                <select
                  value={rekapBulan}
                  onChange={(e) => setRekapBulan(e.target.value)}
                  className="border border-capo-line rounded-panel px-3 py-2 text-[13px] text-capo-ink bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
                >
                  {Array.from({length: 12}).map((_, i) => (
                    <option key={i+1} value={(i+1).toString().padStart(2, '0')}>
                      {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Tahun</label>
                <input
                  type="number"
                  value={rekapTahun}
                  onChange={(e) => setRekapTahun(e.target.value)}
                  className="border border-capo-line rounded-panel px-3 py-2 text-[13px] text-capo-ink bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy w-[100px]"
                />
              </div>
            </div>

            <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden shadow-sm">
              {loadingRekap ? (
                <div className="p-8 text-center text-capo-ink-soft text-[13px]">Memuat rekap...</div>
              ) : rekapData.length === 0 ? (
                <EmptyState icon={Calendar} title="Tidak ada data" description="Belum ada absensi tercatat di bulan ini." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-capo-line bg-capo-bg/50">
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Karyawan</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider text-center">Hadir</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider text-center">Sakit</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider text-center">Izin</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider text-center">Alpa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-capo-line">
                      {rekapData.map((row) => (
                        <tr key={row.userId} className="hover:bg-capo-bg/30">
                          <td className="py-3 px-4">
                            <div className="font-medium text-[13px] text-capo-ink">{row.nama}</div>
                            <div className="text-[11px] text-capo-ink-soft mt-0.5">{row.divisi}</div>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-capo-accent">{row.HADIR > 0 ? row.HADIR : '-'}</td>
                          <td className="py-3 px-4 text-center font-medium text-capo-gold">{row.SAKIT > 0 ? row.SAKIT : '-'}</td>
                          <td className="py-3 px-4 text-center font-medium text-capo-gold">{row.IZIN > 0 ? row.IZIN : '-'}</td>
                          <td className="py-3 px-4 text-center font-medium text-capo-danger">{row.ALPA > 0 ? row.ALPA : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
