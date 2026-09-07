import * as React from "react"
import { Bell } from "lucide-react"

export interface TopbarProps {
  title: string
  context?: string
  actions?: React.ReactNode
}

export function Topbar({ title, context, actions }: TopbarProps) {
  return (
    <header className="h-16 bg-capo-bg border-b border-capo-line px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-baseline gap-3">
        <h1 className="font-oswald text-[24px] md:text-[26px] font-semibold text-capo-ink leading-none">
          {title}
        </h1>
        {context && (
          <span className="text-[12.5px] text-capo-ink-soft hidden md:inline-block">
            {context}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        
        <div className="w-px h-6 bg-capo-line mx-2 hidden md:block" />
        
        <button className="relative p-2 text-capo-ink-soft hover:text-capo-ink transition-colors rounded-full hover:bg-capo-line/20">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-capo-danger rounded-full ring-2 ring-capo-bg" />
        </button>
      </div>
    </header>
  )
}
