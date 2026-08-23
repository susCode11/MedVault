import React from 'react';
import { Card } from '../../components/ui/Card';
import { useAbuseReports } from '../../hooks/useReport';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';
import { ShieldAlert } from 'lucide-react';

export const AbuseReports: React.FC = () => {
  const { reports, isLoading, isError } = useAbuseReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Abuse Reports</h1>
        <p className="text-gray-400">Status of filed reports against unauthorized access.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : isError ? (
        <Card className="p-8 text-center text-danger-500">Failed to load abuse reports.</Card>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No filed abuse reports found.
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report: any) => (
            <Card key={report.id} className="p-4 border-l-4 border-l-danger-500">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <ShieldAlert size={18} className="text-danger-500" />
                    Reported by: {report.reporterId}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Event ID: {report.emergencyEventId}</p>
                  <p className="mt-3 text-gray-300 bg-surface-dark p-3 rounded-md">
                    {report.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${report.resolvedAt ? 'bg-success-500/20 text-success-400' : 'bg-warning-500/20 text-warning-400'}`}>
                    {report.resolvedAt ? 'Resolved' : 'Under Review'}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(report.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
