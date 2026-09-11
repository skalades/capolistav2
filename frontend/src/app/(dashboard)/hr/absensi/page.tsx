'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { API } from '@/lib/api';
import { Users, Check, X, Minus } from 'lucide-react';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type StatusAbsen = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';

interface Karyawan {
  id: number;
  nama: string;
  divisi: string;
  role: string;
}

interface AbsensiEntry {
  userId: number;
  status: StatusAbsen;
}

const STATUS_OPTIONS: { value: StatusAbsen; label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }[] = [
  { value: 'HADIR', label: 'Hadir', variant: 'success' },
  { value: 'IZIN', label: 'Izin', variant: 'warning' },
  { value: 'SAKIT', label: 'Sakit', variant: 'warning' },
  { value: 'ALPA', label: 'Alpha', variant: 'danger' },
];

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function AbsensiPage() {
  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  const [divisiFilter, setDivisiFilter] = useState('');
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [entries, setEntries] = useState<Record<number, StatusAbsen>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const DIVISI_OPTIONS = [
    'PEMASARAN', 'PRODUKSI', 'DESAIN', 'CUTTING', 'JAHIT',
    'PRINTING', 'PEMASANGAN', 'PROCUREMENT', 'GUDANG', 'KEUANGAN', 'HR',
  ];

  // Fetch daftar karyawan aktif
  const fetchKaryawan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (divisiFilter) params.set('divisi', divisiFilter);
      const res = await fetch(`${API}/hr/karyawan?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setKaryawanList(data);
        // Default semua ke HADIR
        const defaultEntries: Record<number, StatusAbsen> = {};
        data.forEach((k: Karyawan) => { defaultEntries[k.id] = 'HADIR'; });
        setEntries(defaultEntries);
      }
    } catch (err) {
      console.error('Gagal fetch karyawan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [divisiFilter]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(entries).map(([userId, status]) => ({
        userId: Number(userId),
        tanggal,
        status,
      }));

      const res = await fetch(`${API}/hr/absensi/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const setAll = (status: StatusAbsen) => {
    const newEntries: Record<number, StatusAbsen> = {};
    karyawanList.forEach((k) => { newEntries[k.id] = status; });
    setEntries(newEntries);
  };

  return (
    <>
      <Topbar
        title="Absensi Karyawan"
        context="Input kehadiran manual oleh Admin / Mandor"
        actions={
          <Button variant="accent" onClick={handleSubmit} disabled={saving || karyawanList.length === 0}>
            {saving ? 'Menyimpan...' : 'Simpan Absensi'}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Sukses Banner */}
        {successMsg && (
          <div className="bg-capo-accent/10 border border-capo-accent/30 rounded-panel px-4 py-3 text-capo-accent text-[13px] font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Filter Row */}
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

          {/* Shortcut buttons */}
          <div className="flex gap-2 ml-auto">
            <span className="text-[11.5px] text-capo-ink-soft self-end mb-2">Set semua:</span>
            <Button variant="secondary" size="sm" onClick={() => setAll('HADIR')}>Hadir</Button>
            <Button variant="secondary" size="sm" onClick={() => setAll('ALPA')}>Alpha</Button>
          </div>
        </div>

        {/* Tabel Absensi */}
        <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-capo-line">
            <h2 className="font-oswald text-[16px] font-semibold text-capo-ink">
              Daftar Karyawan
            </h2>
            <span className="text-[11.5px] text-capo-ink-soft">
              {karyawanList.length} karyawan
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-capo-ink-soft text-[13px]">Memuat data...</div>
          ) : karyawanList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Tidak ada karyawan ditemukan"
              description="Coba ubah filter divisi atau tambah karyawan terlebih dahulu."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-capo-line bg-capo-bg/50">
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Nama</th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Divisi</th>
                    <th className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-capo-line">
                  {karyawanList.map((karyawan) => (
                    <tr key={karyawan.id} className="hover:bg-capo-bg/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-[13px] text-capo-ink">
                        {karyawan.nama}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral">{karyawan.divisi}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setEntries((prev) => ({ ...prev, [karyawan.id]: opt.value }))}
                              className={`px-3 py-1.5 rounded-badge text-[11.5px] font-medium transition-colors border ${
                                entries[karyawan.id] === opt.value
                                  ? opt.value === 'HADIR'
                                    ? 'bg-capo-accent text-white border-capo-accent'
                                    : opt.value === 'ALPA'
                                    ? 'bg-capo-danger text-white border-capo-danger'
                                    : 'bg-capo-gold text-white border-capo-gold'
                                  : 'bg-transparent text-capo-ink-soft border-capo-line hover:bg-capo-line/20'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
