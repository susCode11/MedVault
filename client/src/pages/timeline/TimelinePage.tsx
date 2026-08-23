import React from 'react';
import { TimelineView } from '../../components/timeline/TimelineView';
import { useActorTimeline } from '../../hooks/useTimeline';
import { useAuthStore } from '../../store/authStore';

export const TimelinePage: React.FC = () => {
  const { profile } = useAuthStore();
  const { entries: events = [], isLoading } = useActorTimeline(profile?.principal || null);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Health Timeline</h1>
        <p className="text-gray-400">A complete, chronological history of your healthcare journey.</p>
      </div>

      <div className="bg-surface-dark border border-surface-border rounded-xl p-6 md:p-10">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading timeline events...</div>
        ) : (
          <TimelineView events={events} />
        )}
      </div>
    </div>
  );
};
