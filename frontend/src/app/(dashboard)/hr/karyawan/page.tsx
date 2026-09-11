'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiFetch } from '@/lib/api';
import { Users, Plus, Search, Edit2 } from 'lucide-react';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface Karyawan {
  id: number;
  nama: string;
  email: string;
  role: string;
  divisi: string;
  tipeGaji: 'BORONGAN' | 'HARIAN' | 'BULANAN';
  tarifDefault: number | null;
  statusAktif: boolean;
  createdAt: string;
}

const TIPE_GAJI_LABEL: Record<string, string> = {
  BORONGAN: 'Borongan',
  HARIAN: 'Harian',
  BULANAN: 'Bulanan',
};

const DIVISI_OPTIONS = [
  'PEMASARAN', 'PRODUKSI', 'DESAIN', 'CUTTING', 'JAHIT',
  'PRINTING', 'PEMASANGAN', 'PROCUREMENT', 'GUDANG', 'KEUANGAN', 'HR',
];

const ROLE_OPTIONS = ['SUPERADMIN', 'OWNER', 'ADMIN', 'KEPALA_DIVISI', 'STAF'];

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function KaryawanPage() {
  const [karyawanList, setKaryawanList] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [divisiFilter, setDivisiFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Karyawan | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'STAF',
    divisi: 'JAHIT',
    tipeGaji: 'BULANAN',
    tarifDefault: '',
    statusAktif: true,
  });

  const fetchKaryawan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (divisiFilter) params.set('divisi', divisiFilter);
      const res = await apiFetch(`/hr/karyawan?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setKaryawanList(data);
        else setKaryawanList([]);
      }
    } catch (err) {
      console.error('Gagal fetch karyawan', err);
      setKaryawanList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, [divisiFilter]);

  const openNew = () => {
    setEditTarget(null);
    setForm({ nama: '', email: '', password: '', role: 'STAF', divisi: 'JAHIT', tipeGaji: 'BULANAN', tarifDefault: '', statusAktif: true });
    setShowModal(true);
  };

  const openEdit = (k: Karyawan) => {
    setEditTarget(k);
    setForm({
      nama: k.nama,
      email: k.email,
      password: '',
      role: k.role,
      divisi: k.divisi,
      tipeGaji: k.tipeGaji,
      tarifDefault: k.tarifDefault?.toString() || '',
      statusAktif: k.statusAktif,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        nama: form.nama,
        email: form.email,
        role: form.role,
        divisi: form.divisi,
        tipeGaji: form.tipeGaji,
        tarifDefault: form.tarifDefault ? Number(form.tarifDefault) : null,
        statusAktif: form.statusAktif,
      };
      if (form.password) payload.password = form.password;

      const url = editTarget ? `/users/${editTarget.id}` : `/users`;
      const method = editTarget ? 'PATCH' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchKaryawan();
      }
    } catch (err) {
      console.error('Gagal simpan karyawan', err);
    } finally {
      setSaving(false);
    }
  };

  // Filter client-side by name search
  const filtered = karyawanList.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase()) ||
    k.email.toLowerCase().includes(search.toLowerCase())
  );

  const getTipeGajiVariant = (tipe: string): 'success' | 'warning' | 'neutral' => {
    if (tipe === 'BORONGAN') return 'warning';
    if (tipe === 'HARIAN') return 'success';
    return 'neutral';
  };

  return (
    <>
      <Topbar
        title="Data Karyawan"
        context="Master data seluruh karyawan & operator"
        actions={
          <Button variant="accent" onClick={openNew}>
            <Plus className="w-4 h-4 mr-1.5" /> Tambah Karyawan
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Karyawan', value: karyawanList.length, caption: 'semua divisi' },
            { label: 'Aktif', value: karyawanList.filter(k => k.statusAktif).length, caption: 'status aktif' },
            { label: 'Borongan', value: karyawanList.filter(k => k.tipeGaji === 'BORONGAN').length, caption: 'tipe gaji' },
            { label: 'Harian', value: karyawanList.filter(k => k.tipeGaji === 'HARIAN').length, caption: 'tipe gaji' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-capo-panel border border-capo-line rounded-panel p-4 shadow-sm">
              <p className="text-[11px] text-capo-ink-soft uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="font-oswald text-[28px] font-semibold text-capo-ink leading-tight">{kpi.value}</p>
              <p className="text-[11px] text-capo-ink-soft mt-0.5">{kpi.caption}</p>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        <div className="bg-capo-panel border border-capo-line rounded-panel p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-capo-ink-soft" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-capo-line rounded-panel text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
            />
          </div>
          <select
            value={divisiFilter}
            onChange={(e) => setDivisiFilter(e.target.value)}
            className="border border-capo-line rounded-panel px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
          >
            <option value="">Semua Divisi</option>
            {DIVISI_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Tabel */}
        <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-capo-ink-soft text-[13px]">Memuat data...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum ada karyawan"
              description="Tambah karyawan pertama dengan klik tombol 'Tambah Karyawan'."
              action={<Button variant="accent" size="sm" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1" />Tambah Karyawan</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-capo-line bg-capo-bg/50">
                    {['Nama', 'Email', 'Divisi', 'Role', 'Tipe Gaji', 'Tarif Default', 'Status', 'Aksi'].map((h) => (
                      <th key={h} className="py-2.5 px-4 text-[11px] font-semibold text-capo-ink-soft uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-capo-line">
                  {filtered.map((k) => (
                    <tr key={k.id} className="hover:bg-capo-bg/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-[13px]">{k.nama}</td>
                      <td className="py-3 px-4 font-mono text-[11.5px] text-capo-ink-soft">{k.email}</td>
                      <td className="py-3 px-4"><Badge variant="neutral">{k.divisi}</Badge></td>
                      <td className="py-3 px-4 text-[12.5px] text-capo-ink">{k.role.replace('_', ' ')}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getTipeGajiVariant(k.tipeGaji)}>{TIPE_GAJI_LABEL[k.tipeGaji]}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px]">
                        {k.tarifDefault ? `Rp ${Number(k.tarifDefault).toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={k.statusAktif ? 'success' : 'danger'}>
                          {k.statusAktif ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(k)}>
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? `Edit: ${editTarget.nama}` : 'Tambah Karyawan Baru'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="accent" onClick={handleSave as any} disabled={saving}>
              {saving ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Karyawan'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Nama */}
            <div>
              <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                Nama Lengkap *
              </label>
              <input
                required
                value={form.nama}
                onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))}
                className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-capo-navy"
                placeholder="Nama karyawan"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-capo-navy"
                placeholder="email@capolista.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                Password {editTarget ? '(kosongkan jika tidak diubah)' : '*'}
              </label>
              <input
                required={!editTarget}
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-capo-navy"
                placeholder="Password login"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Role */}
              <div>
                <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                  Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
                >
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>

              {/* Divisi */}
              <div>
                <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                  Divisi *
                </label>
                <select
                  value={form.divisi}
                  onChange={(e) => setForm((p) => ({ ...p, divisi: e.target.value }))}
                  className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
                >
                  {DIVISI_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Tipe Gaji */}
              <div>
                <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                  Tipe Gaji *
                </label>
                <select
                  value={form.tipeGaji}
                  onChange={(e) => setForm((p) => ({ ...p, tipeGaji: e.target.value }))}
                  className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] bg-white focus:outline-none focus:ring-1 focus:ring-capo-navy"
                >
                  {Object.entries(TIPE_GAJI_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {/* Tarif Default */}
              <div>
                <label className="block text-[11.5px] font-semibold text-capo-ink-soft uppercase tracking-wider mb-1">
                  Tarif Default (Rp)
                </label>
                <input
                  type="number"
                  value={form.tarifDefault}
                  onChange={(e) => setForm((p) => ({ ...p, tarifDefault: e.target.value }))}
                  className="w-full border border-capo-line rounded-panel px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-capo-navy"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="statusAktif"
                checked={form.statusAktif}
                onChange={(e) => setForm((p) => ({ ...p, statusAktif: e.target.checked }))}
                className="w-4 h-4 accent-capo-accent"
              />
              <label htmlFor="statusAktif" className="text-[13px] text-capo-ink font-medium">
                Karyawan aktif
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
