import React from 'react';
import { EmergencyAccessEvent } from '../../../types/emergency';
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../../utils/format';

interface EmergencyAuditLogProps {
  events: EmergencyAccessEvent[];
  onReportAbuse: (event: EmergencyAccessEvent) => void;
}

export const EmergencyAuditLog: React.FC<EmergencyAuditLogProps> = ({ events, onReportAbuse }) => {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Date & Time</Th>
          <Th>Doctor</Th>
          <Th>Patient</Th>
          <Th>Reason</Th>
          <Th>Status</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {events.map((event) => {
          const isExpired = Date.now() > event.expiresAt;
          return (
            <Tr key={event.id}>
              <Td>{formatDate(event.accessedAt, 'MMM d, yyyy h:mm a')}</Td>
              <Td className="font-medium text-white">{event.doctorName}</Td>
              <Td>{event.patientName}</Td>
              <Td>
                <div className="max-w-[200px] truncate" title={event.reason}>
                  {event.reason}
                </div>
              </Td>
              <Td>
                {event.reported ? (
                  <Badge variant="danger">Reported</Badge>
                ) : isExpired ? (
                  <Badge variant="default">Expired</Badge>
                ) : (
                  <Badge variant="warning">Active (24h)</Badge>
                )}
              </Td>
              <Td>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={event.reported}
                  onClick={() => onReportAbuse(event)}
                  className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                >
                  {event.reported ? 'Under Review' : 'Report Abuse'}
                </Button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
