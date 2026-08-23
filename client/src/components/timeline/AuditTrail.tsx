import React from 'react';
import { AuditEntry } from '../../types/audit';
import { Table, Thead, Tbody, Tr, Th, Td } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { formatDate, truncatePrincipal } from '../../utils/format';

interface AuditTrailProps {
  entries: AuditEntry[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ entries }) => {
  if (entries.length === 0) {
    return <div className="text-center py-8 text-gray-500">No audit logs found.</div>;
  }

  const getActionBadge = (action: string) => {
    if (action.includes('GRANT') || action.includes('UPLOAD')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('REVOKE') || action.includes('DENY')) return <Badge variant="danger">{action}</Badge>;
    if (action.includes('EMERGENCY')) return <Badge variant="danger" dot>{action}</Badge>;
    return <Badge variant="default">{action}</Badge>;
  };

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Timestamp (UTC)</Th>
          <Th>Action</Th>
          <Th>Performed By</Th>
          <Th>Target ID</Th>
          <Th>Details</Th>
        </Tr>
      </Thead>
      <Tbody>
        {entries.map((entry) => {
          const targetType = entry.targetRecordId.length > 0 ? 'RECORD' : entry.targetPrincipal.length > 0 ? 'USER' : 'NONE';
          const targetId = entry.targetRecordId[0] || entry.targetPrincipal[0] || 'N/A';
          return (
          <Tr key={entry.id}>
            <Td className="text-xs font-mono text-gray-400">
              {formatDate(Number(entry.timestamp) / 1000000, 'yyyy-MM-dd HH:mm:ss')}
            </Td>
            <Td>{getActionBadge(entry.action)}</Td>
            <Td>
              <div>
                <p className="text-sm text-white font-medium">System / User</p>
                <p className="text-xs text-gray-500 font-mono" title={entry.actorPrincipal}>
                  {truncatePrincipal(entry.actorPrincipal, 8)}
                </p>
              </div>
            </Td>
            <Td>
              <div className="flex items-center space-x-2 text-xs">
                <span className="uppercase text-gray-500">{targetType}:</span>
                <span className="font-mono text-gray-400" title={targetId}>
                  {targetId !== 'N/A' ? truncatePrincipal(targetId, 6) : targetId}
                </span>
              </div>
            </Td>
            <Td>
              <div className="max-w-xs truncate text-sm" title={entry.details}>
                {entry.details}
              </div>
            </Td>
          </Tr>
        )})}
      </Tbody>
    </Table>
  );
};
