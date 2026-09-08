import React from 'react';
import { CheckCircle2, MessageSquare, Info } from 'lucide-react';

interface TimelineItemProps {
  log: {
    id: number;
    type: string;
    title: string;
    desc: string;
    createdAt: string;
  };
  isLast: boolean;
}

export default function TimelineItem({ log, isLast }: TimelineItemProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <CheckCircle2 className="w-5 h-5 text-capo-accent" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-capo-purple" />;
      default:
        return <Info className="w-5 h-5 text-capo-ink-soft" />;
    }
  };

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(log.createdAt));

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Vertical line connecting items, hidden for the last item */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-capo-line" />
      )}
      
      {/* Icon */}
      <div className="relative z-10 flex-shrink-0 bg-capo-panel rounded-full mt-1">
        {getIcon(log.type)}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h4 className="text-capo-ink font-semibold text-base">
          {log.title}
        </h4>
        <span className="text-capo-ink-soft text-xs mb-1">
          {formattedDate}
        </span>
        <p className="text-capo-ink text-sm bg-capo-bg p-3 rounded-[var(--radius-panel)] border border-capo-line mt-1">
          {log.desc}
        </p>
      </div>
    </div>
  );
}
