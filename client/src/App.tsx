import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePortalStore } from './store/portalStore';

// Layouts & Auth
import { AppShell } from './components/layout/AppShell';
import { AuthGuard } from './components/auth/AuthGuard';
import { RoleGuard } from './components/auth/RoleGuard';

// Root Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { RoleSelect } from './pages/RoleSelect';
import { AbhaOnboarding } from './pages/AbhaOnboarding';
import { DoctorOnboarding } from './pages/DoctorOnboarding';

// Patient Pages
import {
  PatientDashboard,
  PatientReports,
  PatientPrescriptions,
  PatientLabs,
  PatientHospitals,
  PatientSettings,
  UploadPage
} from './pages/patient';

// Doctor Pages
import {
  DoctorDashboard,
  DoctorPatients,
  DoctorRequestAccess,
  DoctorEmergency,
  DoctorHospital,
  DoctorSettings,
  PatientDetail,
  EmergencyAudit
} from './pages/doctor';

// Control Pages
import { AccessControls, ConsentHistory, AbuseReports } from './pages/control';

// Timeline Pages
import { TimelinePage } from './pages/timeline';

export function App() {
  const { theme } = usePortalStore();

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/role-select" element={<AuthGuard><RoleSelect /></AuthGuard>} />
        <Route path="/onboarding/abha" element={<AuthGuard><AbhaOnboarding /></AuthGuard>} />
        <Route path="/onboarding/doctor" element={<AuthGuard><DoctorOnboarding /></AuthGuard>} />

        {/* Protected Routes with AppShell */}
        <Route element={<AuthGuard><AppShell /></AuthGuard>}>
          
          {/* Patient Routes */}
          <Route path="/patient" element={<RoleGuard role={['patient']}><Navigate to="/patient/dashboard" replace /></RoleGuard>} />
          <Route path="/patient/dashboard" element={<RoleGuard role={['patient']}><PatientDashboard /></RoleGuard>} />
          <Route path="/patient/reports" element={<RoleGuard role={['patient']}><PatientReports /></RoleGuard>} />
          <Route path="/patient/prescriptions" element={<RoleGuard role={['patient']}><PatientPrescriptions /></RoleGuard>} />
          <Route path="/patient/labs" element={<RoleGuard role={['patient']}><PatientLabs /></RoleGuard>} />
          <Route path="/patient/hospitals" element={<RoleGuard role={['patient']}><PatientHospitals /></RoleGuard>} />
          <Route path="/patient/settings" element={<RoleGuard role={['patient']}><PatientSettings /></RoleGuard>} />
          <Route path="/patient/upload" element={<RoleGuard role={['patient']}><UploadPage /></RoleGuard>} />
          <Route path="/patient/timeline" element={<RoleGuard role={['patient']}><TimelinePage /></RoleGuard>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<RoleGuard role={['doctor']}><Navigate to="/doctor/dashboard" replace /></RoleGuard>} />
          <Route path="/doctor/dashboard" element={<RoleGuard role={['doctor']}><DoctorDashboard /></RoleGuard>} />
          <Route path="/doctor/patients" element={<RoleGuard role={['doctor']}><DoctorPatients /></RoleGuard>} />
          <Route path="/doctor/patients/:id" element={<RoleGuard role={['doctor']}><PatientDetail /></RoleGuard>} />
          <Route path="/doctor/request" element={<RoleGuard role={['doctor']}><DoctorRequestAccess /></RoleGuard>} />
          <Route path="/doctor/emergency" element={<RoleGuard role={['doctor']}><DoctorEmergency /></RoleGuard>} />
          <Route path="/doctor/hospital" element={<RoleGuard role={['doctor']}><DoctorHospital /></RoleGuard>} />
          <Route path="/doctor/settings" element={<RoleGuard role={['doctor']}><DoctorSettings /></RoleGuard>} />
          <Route path="/doctor/audit" element={<RoleGuard role={['doctor']}><EmergencyAudit /></RoleGuard>} />

          {/* Control/Access Routes (Shared depending on role implementation, default to patient here for simplicity, but could be either) */}
          <Route path="/control/access" element={<AccessControls />} />
          <Route path="/control/consent" element={<ConsentHistory />} />
          <Route path="/control/abuse" element={<AbuseReports />} />

        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
