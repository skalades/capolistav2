'use server'

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function getSettings() {
  try {
    const token = cookies().get('token')?.value
    
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
    const token = cookies().get('token')?.value
    
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
