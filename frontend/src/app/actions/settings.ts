'use server'

import { cookies } from "next/headers"

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3005'

export async function getSettings() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    const res = await fetch(`${API_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    })
    
    if (!res.ok) {
      return null
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export async function updateSettings(data: any) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    
    if (!res.ok) {
      throw new Error('Failed to update settings')
    }
    
    return { success: true, data: await res.json() }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Terjadi kesalahan saat menyimpan pengaturan' }
  }
}

export async function uploadLogoFile(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    const res = await fetch(`${API_URL}/settings/upload-logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData, fetch does it automatically with boundary
      },
      body: formData
    })
    
    if (!res.ok) {
      throw new Error('Failed to upload logo')
    }
    
    return { success: true, data: await res.json() }
  } catch (error) {
    console.error('Error uploading logo:', error)
    return { success: false, error: 'Gagal mengunggah logo' }
  }
}
