"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./Badge"
import { Clock } from "lucide-react"

export interface KanbanCardType {
  id: string
  orderId: string
  customer: string
  product: string
  stage: string
  deadline?: string
  metadata?: Record<string, string>
}

export interface KanbanColumnProps {
  title: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({ title, count, children }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] shrink-0 bg-capo-line/10 rounded-panel h-full border border-capo-line/50">
      <div className="flex items-center justify-between p-3 border-b border-capo-line/50">
        <h3 className="font-oswald text-[15px] font-semibold text-capo-ink">{title}</h3>
        <span className="bg-capo-line/30 text-capo-ink-soft text-[11px] font-medium px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  data: KanbanCardType
  isActive?: boolean
}

export function KanbanCard({ data, isActive, className, ...props }: KanbanCardProps) {
  return (
    <div
      className={cn(
        "bg-capo-panel border p-3 rounded-panel cursor-pointer transition-all hover:shadow-md",
        isActive ? "border-capo-accent ring-1 ring-capo-accent" : "border-capo-line",
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono text-[12px] font-semibold text-capo-ink">{data.orderId}</span>
        {data.deadline && (
          <div className="flex items-center gap-1 text-[10.5px] text-capo-danger font-medium">
            <Clock className="w-3 h-3" />
            {data.deadline}
          </div>
        )}
      </div>
      <h4 className="text-[13px] font-medium text-capo-ink leading-tight mb-1">{data.customer}</h4>
      <p className="text-[11.5px] text-capo-ink-soft mb-3">{data.product}</p>
      
      {data.metadata && Object.keys(data.metadata).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(data.metadata).map(([key, value]) => (
            <Badge key={key} variant="neutral" className="px-1.5 py-0 text-[10px]">
              {key}: {value}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export interface KanbanBoardProps {
  stages: string[];
  orders: KanbanCardType[];
  activeCardId?: string;
  onCardClick?: (card: KanbanCardType) => void;
}

export function KanbanBoard({ stages, orders, activeCardId, onCardClick }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar items-start">
      {stages.map(stage => {
        const stageOrders = orders.filter(o => o.stage === stage);
        return (
          <KanbanColumn key={stage} title={stage} count={stageOrders.length}>
            {stageOrders.map(order => (
              <KanbanCard 
                key={order.id} 
                data={order} 
                isActive={activeCardId === order.id}
                onClick={() => onCardClick?.(order)}
              />
            ))}
          </KanbanColumn>
        )
      })}
    </div>
  )
}
