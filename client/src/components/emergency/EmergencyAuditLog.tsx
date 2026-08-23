import React from 'react';
import { EmergencyAccessEvent } from '../../types/emergency';
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';

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
          return (
            <Tr key={event.id}>
              <Td>{formatDate(event.createdAt, 'MMM d, yyyy h:mm a')}</Td>
              <Td className="font-medium text-white">{event.doctorName}</Td>
              <Td>{event.patientName}</Td>
              <Td>
                <div className="max-w-[200px] truncate" title={event.reason}>
                  {event.reason}
                </div>
              </Td>
              <Td>
                {event.status === 'reported' ? (
                  <Badge variant="danger">Reported</Badge>
                ) : event.status === 'resolved' ? (
                  <Badge variant="default">Resolved</Badge>
                ) : event.status === 'acknowledged' ? (
                  <Badge variant="warning">Acknowledged</Badge>
                ) : (
                  <Badge variant="warning">Active</Badge>
                )}
              </Td>
              <Td>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={event.status === 'reported' || event.status === 'resolved'}
                  onClick={() => onReportAbuse(event)}
                  className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                >
                  {event.status === 'reported' ? 'Under Review' : 'Report Abuse'}
                </Button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
