'use client'

import React, { useState } from 'react'
import { updateSettings, uploadLogoFile } from '@/app/actions/settings'
import { Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export function PengaturanClient({ initialSettings }: { initialSettings: any }) {
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    logoUrl: initialSettings?.logoUrl || '',
    companyName: initialSettings?.companyName || 'Capolista',
    address: initialSettings?.address || '',
    bankAccount: initialSettings?.bankAccount || '',
    receiptNote: initialSettings?.receiptNote || '',
    invoiceNote: initialSettings?.invoiceNote || ''
  })
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const data = new FormData()
    data.append('file', file)

    const res = await uploadLogoFile(data)
    if (res.success && res.data?.url) {
      // Create full URL (assuming backend is at API_URL)
      const fullUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}${res.data.url}` 
        : `http://localhost:3001${res.data.url}`;
      
      setFormData({ ...formData, logoUrl: fullUrl })
      setMessage({ type: 'success', text: 'Logo berhasil diunggah! Jangan lupa klik Simpan Pengaturan.' })
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal mengunggah logo' })
    }
    setUploadingLogo(false)
    setTimeout(() => setMessage(null), 4000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    const res = await updateSettings(formData)
    
    if (res.success) {
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan' })
    } else {
      setMessage({ type: 'error', text: res.error || 'Gagal menyimpan pengaturan' })
    }
    
    setLoading(false)
    
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pengaturan Sistem</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {message && (
            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Informasi Perusahaan</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
              <input 
                type="text" 
                name="companyName" 
                value={formData.companyName} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-capo-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Perusahaan</label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-gray-50 overflow-hidden relative">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingLogo ? 'Mengunggah...' : 'Pilih Gambar'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      disabled={uploadingLogo}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Gunakan format PNG, JPG, atau WEBP. Maks. 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Perusahaan</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-capo-accent"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Informasi Pembayaran & Rekening</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detail Rekening (Tampil di Invoice)</label>
              <textarea 
                name="bankAccount" 
                value={formData.bankAccount} 
                onChange={handleChange}
                rows={3}
                placeholder="BCA 1234567890 a.n Capolista"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-capo-accent"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Catatan Dokumen</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan / Footer Kwitansi</label>
              <textarea 
                name="receiptNote" 
                value={formData.receiptNote} 
                onChange={handleChange}
                rows={2}
                placeholder="Terima kasih atas pesanan Anda."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-capo-accent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan / Syarat & Ketentuan Invoice</label>
              <textarea 
                name="invoiceNote" 
                value={formData.invoiceNote} 
                onChange={handleChange}
                rows={3}
                placeholder="Barang yang sudah dibeli tidak dapat dikembalikan."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-capo-accent"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-capo-accent text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
