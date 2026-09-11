"use client"

import { API } from '@/lib/api';

import * as React from "react"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { Check, X } from "lucide-react"

export default function ApprovalBoronganPage() {
  const [approvals, setApprovals] = React.useState<any[]>([]);

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${API}/hr/pending-approvals`);
      const data = await res.json();
      setApprovals(data);
    } catch (err) {
      console.error("Gagal menarik data approval", err);
    }
  };

  React.useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: number, pcsApproved: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch(`${API}/hr/approve-output/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, pcsApproved })
      });
      fetchApprovals();
    } catch (err) {
      console.error("Gagal approval", err);
    }
  };

  return (
    <>
      <Topbar 
        title="Approval Borongan" 
        context="Setujui atau tolak klaim hasil produksi harian dari staf/penjahit" 
      />
      
      <div className="p-6 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white rounded-panel border border-capo-line p-5 shadow-sm">
          <h2 className="text-[16px] font-oswald font-semibold text-capo-ink mb-4">Daftar Menunggu Persetujuan</h2>
          
          {approvals.length === 0 ? (
            <div className="text-center p-8 text-capo-ink-soft bg-capo-bg rounded border border-dashed border-capo-line">
              Tidak ada klaim borongan yang perlu di-approve saat ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-capo-line text-[12px] text-capo-ink-soft uppercase tracking-wider">
                    <th className="p-3 font-semibold">Tgl Klaim</th>
                    <th className="p-3 font-semibold">Operator</th>
                    <th className="p-3 font-semibold">Order</th>
                    <th className="p-3 font-semibold">Klaim Pcs</th>
                    <th className="p-3 font-semibold">Tarif/Pcs</th>
                    <th className="p-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-capo-ink align-middle">
                  {approvals.map((item) => (
                    <tr key={item.id} className="border-b border-capo-line hover:bg-capo-bg transition-colors">
                      <td className="p-3">{new Date(item.tanggalKlaim).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 font-medium">{item.assign?.operator?.nama}</td>
                      <td className="p-3">
                        <span className="font-mono bg-capo-line/20 px-1.5 py-0.5 rounded text-[11px] font-semibold">{item.assign?.order?.noOrder}</span>
                      </td>
                      <td className="p-3 font-bold text-capo-navy">{item.pcsKlaim} pcs</td>
                      <td className="p-3 text-capo-ink-soft">Rp {item.assign?.tarifPerPcs}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleApprove(item.id, 0, 'REJECTED')}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          >
                            <X className="w-4 h-4 mr-1" /> Tolak
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleApprove(item.id, item.pcsKlaim, 'APPROVED')}
                          >
                            <Check className="w-4 h-4 mr-1" /> Terima ({item.pcsKlaim} pcs)
                          </Button>
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
  )
}
