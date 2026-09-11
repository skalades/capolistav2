'use client';

/**
 * Hook untuk logout — extract dari duplikasi di Sidebar & StafDashboard.
 * Panggil `logout()` dari mana saja dalam client component.
 */
export function useLogout() {
  const logout = async () => {
    const { logoutUser } = await import('@/app/actions/auth');
    await logoutUser();
    window.location.href = '/';
  };

  return { logout };
}
