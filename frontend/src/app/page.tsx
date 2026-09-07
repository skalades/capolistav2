import { Sidebar } from '@/components/layout/Sidebar';
import KPICard from '@/components/dashboard/KPICard';
import { ShoppingCart, Scissors, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-capo-bg flex">
      <Sidebar />
      <main className="flex-1 ml-[230px] p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-oswald text-capo-ink font-semibold">Dashboard Utama</h1>
          <p className="text-capo-ink-soft text-sm mt-1">Selamat datang kembali, Admin.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard 
            title="Total Order Aktif" 
            value="24" 
            subtitle="8 Menunggu Pembayaran"
            icon={<ShoppingCart size={20} />}
          />
          <KPICard 
            title="Produksi Selesai" 
            value="156" 
            subtitle="Bulan ini"
            icon={<Scissors size={20} />}
          />
          <KPICard 
            title="Omzet" 
            value="Rp 12.500.000" 
            subtitle="Naik 12% dari bulan lalu"
            icon={<TrendingUp size={20} />}
          />
        </section>

        <section className="bg-capo-panel border border-capo-line rounded-[var(--radius-panel)] p-6 min-h-[300px] shadow-sm">
          <h2 className="text-lg font-oswald text-capo-ink mb-4">Aktivitas Terbaru</h2>
          <div className="flex items-center justify-center h-48 text-capo-ink-soft text-sm border-2 border-dashed border-capo-line rounded">
            Belum ada aktivitas yang dapat ditampilkan.
          </div>
        </section>
      </main>
    </div>
  );
}
