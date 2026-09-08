'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) throw new Error('Not authenticated');

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export async function getUsers() {
  try {
    return await fetchWithAuth('/users');
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function createUser(data: any) {
  try {
    const user = await fetchWithAuth('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUser(id: number, data: any) {
  try {
    const user = await fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: number) {
  try {
    await fetchWithAuth(`/users/${id}`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
