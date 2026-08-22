import React from 'react';
import { MedicalRecord } from '../../../types/records';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate, formatFileSize } from '../../../utils/format';
import { FileText, Download, Share2, MoreVertical, ShieldCheck, Activity } from 'lucide-react';
import { CONSTANTS } from '../../../utils/constants';
import { Dropdown } from '../ui/Dropdown';

interface RecordCardProps {
  record: MedicalRecord;
  onClick: (record: MedicalRecord) => void;
  onShare?: (record: MedicalRecord) => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, onClick, onShare }) => {
  const catConfig = CONSTANTS.RECORD_CATEGORIES.find(c => c.id === record.category) || CONSTANTS.RECORD_CATEGORIES[6];
  
  const menuItems = [
    { id: 'view', label: 'View Details', icon: <FileText size={16} />, onClick: () => onClick(record) },
    { id: 'download', label: 'Download', icon: <Download size={16} /> },
    { id: 'share', label: 'Manage Access', icon: <Share2 size={16} />, onClick: () => onShare?.(record) },
  ];

  return (
    <Card hover className="group cursor-pointer relative overflow-hidden" onClick={() => onClick(record)}>
      <div className={`absolute top-0 left-0 w-1 h-full bg-${catConfig.color}-500`} />
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg bg-${catConfig.color}-500/20 text-${catConfig.color}-400`}>
            {record.category === 'lab_report' ? <Activity size={24} /> : <FileText size={24} />}
          </div>
          
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown 
              trigger={<button className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-surface-hover"><MoreVertical size={20} /></button>}
              items={menuItems}
            />
          </div>
        </div>

        <h4 className="text-lg font-semibold text-white mb-1 truncate">{record.title}</h4>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{record.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {record.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="default" className="text-[10px]">#{tag}</Badge>
          ))}
          {record.tags.length > 3 && <Badge variant="default" className="text-[10px]">+{record.tags.length - 3}</Badge>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-surface-border">
          <span>{formatDate(record.createdAt)}</span>
          <div className="flex items-center space-x-2">
            <span>{formatFileSize(record.fileSize)}</span>
            <ShieldCheck size={14} className="text-success-400" title="Encrypted on IPFS" />
          </div>
        </div>
      </div>
    </Card>
  );
};
