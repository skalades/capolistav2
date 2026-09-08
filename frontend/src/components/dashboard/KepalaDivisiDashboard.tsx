import { Topbar } from "@/components/layout/Topbar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export function KepalaDivisiDashboard({ user }: { user: any }) {
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
            <p className="text-3xl font-oswald text-capo-accent">12</p>
            <p className="text-capo-ink-soft text-sm">Output staf menunggu review</p>
          </div>
          <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
            <h3 className="font-oswald text-capo-ink text-lg mb-2">Order Dikerjakan</h3>
            <p className="text-3xl font-oswald text-capo-ink">5</p>
            <p className="text-capo-ink-soft text-sm">Sedang dalam antrean divisi</p>
          </div>
        </div>

        <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
          <h2 className="font-oswald text-[16px] font-semibold text-capo-ink mb-4">Tim Anda</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-capo-line">
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Nama Staf</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Output Hari Ini</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Status</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-capo-line">
                {[
                  { name: "Andi (Jahit)", output: "45 pcs", status: "Aktif", variant: "success" as const },
                  { name: "Budi (Jahit)", output: "20 pcs", status: "Izin", variant: "warning" as const },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-medium text-[13px]">{row.name}</td>
                    <td className="py-3 px-3 text-[13px]">{row.output}</td>
                    <td className="py-3 px-3">
                      <Badge variant={row.variant}>{row.status}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button variant="secondary" size="sm">Review</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
