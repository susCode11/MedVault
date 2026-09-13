import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../ui/Card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate, Navigate } from 'react-router-dom';

interface RoleGuardProps {
  role: UserRole | UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ role, children }) => {
  const { role: userRole, profile } = useAuthStore();
  const { isAuthenticated, isProfileLoading } = useAuth();
  const navigate = useNavigate();

  // If we are authenticated but have no profile after loading, they need to select a role
  if (isAuthenticated && !isProfileLoading && !profile) {
    return <Navigate to="/login" replace />;
  }

  let isAllowed = Array.isArray(role) ? role.includes(userRole as UserRole) : userRole === role;
  
  // Doctors implicitly have access to patient routes for their own personal records
  if (userRole === 'doctor' && (Array.isArray(role) ? role.includes('patient') : role === 'patient')) {
    isAllowed = true;
  }

  // Enforce onboarding checks for protected routes
  if (isAllowed && profile) {
    // ABHA linking is optional, so we do not force a redirect here for patients.
    if (userRole === 'doctor' && !(profile as any).licenseNumber) {
      return <Navigate to="/onboarding/doctor" replace />;
    }
  }

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
