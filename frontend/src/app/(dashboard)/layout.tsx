import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { Sidebar } from "@/components/layout/Sidebar"

/**
 * Dashboard Layout — Server Component.
 * Fetches current user server-side dan pass ke Sidebar sebagai props
 * sehingga sidebar bisa filter menu berdasarkan role & divisi secara akurat.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Guard: jika tidak ada sesi aktif, redirect ke login
  if (!user) {
    redirect("/")
  }

  // Staf (level 4) tidak pakai sidebar desktop — mereka pakai mobile layout
  // Redirect ke halaman mobile khusus staf
  if (user.role === "STAF") {
    // Biarkan render — StafDashboard sudah punya layout sendiri (mobile)
    return (
      <div className="h-screen bg-capo-bg overflow-hidden">
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-capo-bg overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 ml-[230px] flex flex-col h-full overflow-hidden">
        {/* Children harus menyertakan Topbar dan area konten scrollable */}
        {children}
      </main>
    </div>
  )
}
