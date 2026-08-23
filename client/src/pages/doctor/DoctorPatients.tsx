import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export const DoctorPatients: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();


  const handleSearch = () => {
    if (searchQuery.trim()) {
      // In a real app, query useCanisterActor for patient ID matching name/abha
      // For now, redirect to the patient detail page directly simulating a hit
      navigate(`/doctor/patients/${searchQuery}`);
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
          <Button variant="outline" onClick={handleSearch}>Search</Button>
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
