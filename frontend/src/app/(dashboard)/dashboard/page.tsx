import { getCurrentUser } from "@/app/actions/auth"
import { OwnerDashboard } from "@/components/dashboard/OwnerDashboard"
import { KepalaDivisiDashboard } from "@/components/dashboard/KepalaDivisiDashboard"
import { StafDashboard } from "@/components/dashboard/StafDashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Harap login kembali.</div>
  }

  if (user.role === 'SUPERADMIN' || user.role === 'OWNER' || user.role === 'ADMIN') {
    return <OwnerDashboard />
  }

  if (user.role === 'KEPALA_DIVISI') {
    return <KepalaDivisiDashboard user={user} />
  }

  if (user.role === 'STAF') {
    return <StafDashboard user={user} />
  }

  return <OwnerDashboard />
}
