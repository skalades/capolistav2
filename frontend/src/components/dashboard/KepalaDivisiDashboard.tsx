"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Topbar } from "@/components/layout/Topbar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export function KepalaDivisiDashboard({ user }: { user: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiFetch('/dashboard/divisi');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Gagal load dashboard divisi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-capo-ink-soft">Memuat data tim Anda...</div>;
  }

  return (
    <>
      <Topbar 
        title={`Dashboard Divisi ${user?.divisi || ''}`}
        context="Ringkasan tugas divisi Anda" 
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <h3 className="font-oswald text-capo-ink text-lg mb-2">Perlu Approval</h3>
            <p className="text-3xl font-oswald text-capo-accent">{data.perluApproval}</p>
            <p className="text-capo-ink-soft text-sm">Output staf menunggu review</p>
            {data.perluApproval > 0 && (
              <Link href="/hr/approval-borongan">
                <Button variant="outline" size="sm" className="mt-3">Review Sekarang</Button>
              </Link>
            )}
          </div>
          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <h3 className="font-oswald text-capo-ink text-lg mb-2">Order Dikerjakan</h3>
            <p className="text-3xl font-oswald text-capo-ink">{data.orderDikerjakan}</p>
            <p className="text-capo-ink-soft text-sm">Sedang dalam antrean divisi</p>
            <Link href={`/divisi/${user?.divisi?.toLowerCase()}`}>
              <Button variant="secondary" size="sm" className="mt-3">Buka Papan Produksi</Button>
            </Link>
          </div>
        </div>

        <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
          <h2 className="font-oswald text-[16px] font-semibold text-capo-ink mb-4">Tim Anda (Hari Ini)</h2>
          <div className="overflow-x-auto">
            {data.tim.length === 0 ? (
              <div className="text-center p-4 text-sm text-capo-ink-soft">Belum ada data staf di divisi ini.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-capo-line">
                    <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Nama Staf</th>
                    <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Output Hari Ini</th>
                    <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-capo-line">
                  {data.tim.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 px-3 font-medium text-[13px]">{row.name}</td>
                      <td className="py-3 px-3 text-[13px] font-bold text-capo-navy">{row.output}</td>
                      <td className="py-3 px-3">
                        <Badge variant={row.variant}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
