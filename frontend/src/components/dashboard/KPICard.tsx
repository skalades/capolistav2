import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
}

export default function KPICard({ title, value, subtitle, icon }: KPICardProps) {
  return (
    <div className="bg-capo-panel border border-capo-line rounded-[var(--radius-panel)] p-5 flex flex-col shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-capo-ink-soft text-sm font-medium">{title}</h3>
        {icon && <div className="text-capo-accent">{icon}</div>}
      </div>
      <div className="text-3xl font-oswald text-capo-ink mt-1">{value}</div>
      {subtitle && <p className="text-xs text-capo-ink-soft mt-2">{subtitle}</p>}
    </div>
  );
}
