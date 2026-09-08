"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { createUser, updateUser } from "@/app/actions/users"
import { useRouter } from "next/navigation"

type UserFormModalProps = {
  user?: any
  onClose: () => void
}

const ROLES = ["SUPERADMIN", "OWNER", "ADMIN", "KEPALA_DIVISI", "STAF"]
const DIVISIONS = ["PEMASARAN", "PRODUKSI", "DESAIN", "CUTTING", "JAHIT", "PRINTING", "PEMASANGAN", "PROCUREMENT", "GUDANG", "KEUANGAN", "HR"]
const TIPES = ["BORONGAN", "HARIAN", "BULANAN"]

export function UserFormModal({ user, onClose }: UserFormModalProps) {
  const router = useRouter()
  const isEdit = !!user

  const [formData, setFormData] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "STAF",
    divisi: user?.divisi || "PRODUKSI",
    tipeGaji: user?.tipeGaji || "BULANAN",
    statusAktif: user ? user.statusAktif : true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    const finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const dataToSend = { ...formData }
    if (isEdit && !dataToSend.password) {
      delete (dataToSend as any).password
    }

    const res = isEdit 
      ? await updateUser(user.id, dataToSend)
      : await createUser(dataToSend)

    if (res.success) {
      router.refresh()
      onClose()
    } else {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-capo-panel border border-capo-line rounded-panel w-full max-w-lg p-6 shadow-xl">
        <h2 className="font-oswald text-xl text-capo-ink mb-4">
          {isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-sans">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-capo-ink-soft mb-1 text-[11px] uppercase tracking-wider font-mono">Nama</label>
              <input required name="nama" value={formData.nama} onChange={handleChange} className="w-full p-2 border border-capo-line rounded bg-capo-bg text-capo-ink" />
            </div>
            <div>
              <label className="block text-capo-ink-soft mb-1 text-[11px] uppercase tracking-wider font-mono">Email</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-capo-line rounded bg-capo-bg text-capo-ink" />
            </div>
          </div>
          
          <div>
            <label className="block text-capo-ink-soft mb-1 text-[11px] uppercase tracking-wider font-mono">
              Password {isEdit && <span className="text-gray-400 normal-case">(kosongkan jika tidak ingin ganti)</span>}
            </label>
            <input required={!isEdit} type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border border-capo-line rounded bg-capo-bg text-capo-ink" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-capo-ink-soft mb-1 text-[11px] uppercase tracking-wider font-mono">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-capo-line rounded bg-capo-bg text-capo-ink">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-capo-ink-soft mb-1 text-[11px] uppercase tracking-wider font-mono">Divisi</label>
              <select name="divisi" value={formData.divisi} onChange={handleChange} className="w-full p-2 border border-capo-line rounded bg-capo-bg text-capo-ink">
                {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-capo-ink-soft mb-1 text-[11px] uppercase tracking-wider font-mono">Tipe Gaji</label>
              <select name="tipeGaji" value={formData.tipeGaji} onChange={handleChange} className="w-full p-2 border border-capo-line rounded bg-capo-bg text-capo-ink">
                {TIPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-capo-ink">
                <input type="checkbox" name="statusAktif" checked={formData.statusAktif} onChange={handleChange} className="w-4 h-4" />
                Status Aktif
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-capo-line">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Batal</Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
