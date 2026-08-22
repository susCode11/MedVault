import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { UserRole } from '../../../types/auth';
import { Card } from '../ui/Card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  role: UserRole | UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ role, children }) => {
  const { role: userRole } = useAuthStore();
  const navigate = useNavigate();

  const isAllowed = Array.isArray(role) ? role.includes(userRole as UserRole) : userRole === role;

  if (!isAllowed) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <ShieldAlert size={64} className="text-danger-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You do not have the required permissions to view this page. This area is restricted to {Array.isArray(role) ? role.join('s and ') : role}s.
          </p>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
