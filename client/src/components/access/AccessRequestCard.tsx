import React from 'react';
import { AccessRequest } from '../../../types/access';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, ShieldAlert, Check, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import clsx from 'clsx';

interface AccessRequestCardProps {
  request: AccessRequest;
  onApprove: (request: AccessRequest) => void;
  onDeny: (request: AccessRequest) => void;
  isDoctorView?: boolean;
}

export const AccessRequestCard: React.FC<AccessRequestCardProps> = ({ request, onApprove, onDeny, isDoctorView = false }) => {
  const isEmergency = request.accessType === 'emergency';
  
  return (
    <Card className={clsx(isEmergency ? "border-danger-500/50 shadow-glow" : "")}>
      <CardHeader className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <Avatar name={isDoctorView ? request.patientId : request.doctorId} size="md" />
          <div>
            <h4 className="font-medium text-white">
              {isDoctorView ? 'Patient: ' + request.patientId : 'Dr. ' + request.doctorId}
            </h4>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <Clock size={12} className="mr-1" />
              <span>Requested {request.durationHours} hours access</span>
            </div>
          </div>
        </div>
        {isEmergency && (
          <div className="flex items-center text-danger-400 text-xs font-semibold px-2 py-1 bg-danger-500/10 rounded-lg">
            <ShieldAlert size={14} className="mr-1" /> Emergency
          </div>
        )}
      </CardHeader>
      
      <CardBody>
        <div className="bg-surface-dark rounded-xl p-3 mb-4">
          <p className="text-sm text-gray-300 font-medium">Reason:</p>
          <p className="text-sm text-gray-400 mt-1">{request.reason}</p>
        </div>
        
        <p className="text-sm text-gray-300">
          Requested records: <span className="font-semibold text-white">{request.recordIds.length === 0 ? 'All Records' : `${request.recordIds.length} specific records`}</span>
        </p>
      </CardBody>
      
      {!isDoctorView && (
        <CardFooter className="flex space-x-3">
          <Button variant="ghost" className="flex-1 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10" onClick={() => onDeny(request)}>
            <X size={18} className="mr-2" /> Deny
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => onApprove(request)}>
            <Check size={18} className="mr-2" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
