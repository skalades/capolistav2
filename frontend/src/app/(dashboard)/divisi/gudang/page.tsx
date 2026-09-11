"use client";

import { API } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { KpiCard } from '@/components/ui/KpiCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || `${API}`}`;

export default function GudangPage() {
  const [bahan, setBahan] = useState([]);
  const [isOpnameModalOpen, setOpnameModalOpen] = useState(false);
  const [selectedBahanId, setSelectedBahanId] = useState('');
  const [stokFisik, setStokFisik] = useState('');
  const [catatan, setCatatan] = useState('');

  const fetchBahan = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory/bahan`);
      const data = await res.json();
      setBahan(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBahan();
  }, []);

  const handleOpnameSubmit = async () => {
    try {
      await fetch(`${API_URL}/inventory/opname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bahanId: Number(selectedBahanId),
          stokFisik: Number(stokFisik),
          catatan,
        }),
      });
      setOpnameModalOpen(false);
      setStokFisik('');
      setCatatan('');
      setSelectedBahanId('');
      fetchBahan();
    } catch (err) {
      console.error(err);
    }
  };

  const totalBahan = bahan.length;
  const menipisCount = bahan.filter((b: any) => Number(b.stok) <= Number(b.minimumStok)).length;

  return (
    <div className="flex flex-col min-h-screen bg-capo-bg text-capo-ink">
      <Topbar title="Gudang & Inventory" context="Manajemen Stok Bahan" />
      
      <div className="p-6 space-y-6 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KpiCard title="Total Jenis Bahan" value={totalBahan.toString()} />
          <KpiCard title="Stok Menipis" value={menipisCount.toString()} status="danger" caption="Perlu Restock" />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-oswald font-medium">Daftar Bahan Baku</h2>
          <Button onClick={() => setOpnameModalOpen(true)}>Stok Opname</Button>
        </div>

        <div className="bg-capo-panel border border-capo-line rounded-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 border-b border-capo-line text-sm text-capo-ink-soft">
                <th className="p-4 font-medium">Nama Bahan</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Stok</th>
                <th className="p-4 font-medium">Satuan</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bahan.map((item: any) => {
                const isMenipis = Number(item.stok) <= Number(item.minimumStok);
                return (
                  <tr key={item.id} className="border-b border-capo-line hover:bg-black/5">
                    <td className="p-4">{item.namaBahan}</td>
                    <td className="p-4">{item.kategori}</td>
                    <td className="p-4 font-mono">{Number(item.stok).toFixed(2)}</td>
                    <td className="p-4">{item.satuan}</td>
                    <td className="p-4">
                      {isMenipis ? (
                        <Badge variant="danger">Stok Menipis</Badge>
                      ) : (
                        <Badge variant="success">Aman</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bahan.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-capo-ink-soft">Belum ada data bahan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isOpnameModalOpen}
        onClose={() => setOpnameModalOpen(false)}
        title="Catat Stok Opname"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpnameModalOpen(false)}>Batal</Button>
            <Button onClick={handleOpnameSubmit} disabled={!selectedBahanId || !stokFisik}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-capo-ink-soft">Bahan Baku</label>
            <select
              className="w-full px-3 py-2 bg-capo-bg border border-capo-line rounded-md focus:outline-none focus:border-capo-accent"
              value={selectedBahanId}
              onChange={(e) => setSelectedBahanId(e.target.value)}
            >
              <option value="">-- Pilih Bahan --</option>
              {bahan.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.namaBahan} (Sistem: {Number(item.stok)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-capo-ink-soft">Stok Fisik Aktual</label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-capo-bg border border-capo-line rounded-md focus:outline-none focus:border-capo-accent"
              value={stokFisik}
              onChange={(e) => setStokFisik(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-capo-ink-soft">Catatan (Opsional)</label>
            <textarea
              className="w-full px-3 py-2 bg-capo-bg border border-capo-line rounded-md focus:outline-none focus:border-capo-accent"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Contoh: Ada barang rusak..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
