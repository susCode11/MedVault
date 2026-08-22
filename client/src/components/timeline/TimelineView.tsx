import React from 'react';
import { TimelineCard, TimelineEvent } from './TimelineCard';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  // Group events by month/year
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.timestamp);
    const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-400">No events found in this timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-surface-border ml-4 sm:ml-8 space-y-12 pb-12 animate-fade-in">
      {Object.entries(groupedEvents).map(([month, monthEvents]) => (
        <div key={month} className="relative">
          {/* Month Header */}
          <div className="absolute -left-3 top-0">
            <div className="bg-surface-dark px-2">
              <span className="w-6 h-6 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </span>
            </div>
          </div>
          
          <h3 className="pl-8 text-lg font-semibold text-white mb-6 pt-1">{month}</h3>
          
          <div className="space-y-6">
            {monthEvents.map((event) => (
              <TimelineCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
