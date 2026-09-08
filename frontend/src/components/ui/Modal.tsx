import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg bg-capo-panel border border-capo-line rounded-panel shadow-lg flex flex-col mx-4 max-h-[90vh]",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-capo-line bg-black/5">
          <h2 className="font-oswald text-lg font-medium text-capo-ink">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-capo-ink-soft hover:text-capo-ink hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-capo-accent/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-capo-line bg-black/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
