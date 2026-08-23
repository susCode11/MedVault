import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCanisterActor } from '../../hooks/useCanister';
import { useNotificationStore } from '../../store/notificationStore';

export const DoctorPatients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [isSearching, setIsSearching] = useState(false);
  const { actor, isReady } = useCanisterActor();
  const { error } = useNotificationStore();

  const handleSearch = async () => {
    if (!searchQuery.trim() || !isReady) return;
    
    setIsSearching(true);
    try {
      const res = await (actor as any).lookupPatientByAbha(searchQuery.trim());
      if ('error' in res) {
        throw new Error(res.error.message);
      }
      if (res.ok && res.ok.length > 0) {
        // Patient found, navigate to their detail page using their actual Principal ID
        navigate(`/doctor/patients/${res.ok[0].id}`);
      } else {
        error('Patient not found', 'No patient found with that ABHA ID. Please check and try again.');
      }
    } catch (err) {
      error('Search failed', 'An error occurred while looking up the patient.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Patient Lookup</h1>
          <p className="text-gray-400">Search for patients to view their medical records.</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4">
          <Input
            className="flex-1"
            placeholder="Search by ABHA ID, Name, or Phone Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftIcon={<Search size={18} />}
          />
          <Button variant="outline" onClick={handleSearch} isLoading={isSearching}>Search</Button>
        </div>
      </Card>

      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center mx-auto mb-4 text-gray-500">
          <Search size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Search for a Patient</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          Enter a patient's ABHA ID or name to look up their profile and request access to their records.
        </p>
      </div>
    </div>
  );
};
