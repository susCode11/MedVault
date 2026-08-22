import React, { useState } from 'react';
import { BreakGlassButton } from '../../components/emergency/BreakGlassButton';
import { EmergencyForm } from '../../components/emergency/EmergencyForm';
import { useBreakGlass } from '../../hooks/useEmergency';
import { useNotificationStore } from '../../store/notificationStore';

export const DoctorEmergency: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const breakGlass = useBreakGlass();
  const { addToast } = useNotificationStore();

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
                await breakGlass.mutateAsync({
                  patientId: data.patientId,
                  reason: data.reason,
                });
                addToast({ type: 'success', message: 'Emergency access granted' });
                setIsFormVisible(false);
              } catch (error) {
                addToast({ type: 'error', message: 'Failed to request emergency access' });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
