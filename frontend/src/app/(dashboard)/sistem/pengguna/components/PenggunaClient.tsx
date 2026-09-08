"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { UserFormModal } from "./UserFormModal"
import { deleteUser } from "@/app/actions/users"
import { useRouter } from "next/navigation"

export function PenggunaClient({ users }: { users: any[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus pengguna ini?")) {
      await deleteUser(id)
      router.refresh()
    }
  }

  return (
    <>
      <Topbar 
        title="Pengguna & Akses" 
        context="Manajemen akun dan hak akses divisi" 
        actions={
          <Button variant="accent" onClick={handleAdd}>Tambah Pengguna</Button>
        }
      />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="bg-capo-panel border border-capo-line rounded-panel p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-oswald text-[16px] font-semibold text-capo-ink">Daftar Pengguna</h2>
            <span className="text-[11.5px] text-capo-ink-soft">Total: {users.length} pengguna</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-capo-line">
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Nama</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Email</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Role</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Divisi</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase">Status</th>
                  <th className="py-2 px-3 text-[11.5px] font-normal text-capo-ink-soft uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-capo-line">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-3 font-medium text-[13px]">{u.nama}</td>
                    <td className="py-3 px-3 text-[13px] font-mono text-capo-ink-soft">{u.email}</td>
                    <td className="py-3 px-3">
                      <Badge variant={u.role === 'SUPERADMIN' || u.role === 'OWNER' ? 'danger' : 'secondary'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[12px] uppercase tracking-wider font-semibold text-capo-ink-soft">
                        {u.divisi}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={u.statusAktif ? 'success' : 'warning'}>
                        {u.statusAktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(u)}>Edit</Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDelete(u.id)}>Hapus</Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-capo-ink-soft">
                      Belum ada pengguna terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <UserFormModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}
