import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-capo-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[230px] flex flex-col h-full overflow-hidden">
        {/* Children should include Topbar and the scrollable content area */}
        {children}
      </main>
    </div>
  )
}
