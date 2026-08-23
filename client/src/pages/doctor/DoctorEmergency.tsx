import React, { useState } from 'react';
import { BreakGlassButton } from '../../components/emergency/BreakGlassButton';
import { EmergencyForm } from '../../components/emergency/EmergencyForm';
import { useTriggerEmergency } from '../../hooks/useEmergency';

export const DoctorEmergency: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { triggerEmergency } = useTriggerEmergency();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 text-danger-500">Emergency Protocol</h1>
        <p className="text-gray-400">Break glass to access patient records in life-threatening situations.</p>
      </div>

      {!isFormVisible ? (
        <div className="flex flex-col items-center justify-center py-12">
          <BreakGlassButton onActivate={() => setIsFormVisible(true)} />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <EmergencyForm 
            onCancel={() => setIsFormVisible(false)}
            onSubmit={async (data) => {
              try {
                await triggerEmergency({
                  patientId: data.patientId,
                  reason: data.reason,
                  justification: data.reason // assuming reason goes to justification if missing
                });
                setIsFormVisible(false);
              } catch (error) {
                // error is already handled by useTriggerEmergency hook and notificationStore
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
