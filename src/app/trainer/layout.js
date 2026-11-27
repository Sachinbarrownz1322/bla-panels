'use client';

import React from 'react';
import { LayoutDashboard, Layers, Users, ClipboardCheck, Award, BarChart3 } from 'lucide-react';
import PortalShell from '../../components/shared/PortalShell';

const TRAINER_NAV = [
  { label: 'Dashboard', href: '/trainer', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Assigned Batches', href: '/trainer/batches', icon: <Layers className="w-4 h-4" /> },
  { label: 'Batch Students', href: '/trainer/students', icon: <Users className="w-4 h-4" /> },
  { label: 'Mark Attendance', href: '/trainer/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: 'Assessments', href: '/trainer/assessments', icon: <Award className="w-4 h-4" /> },
  { label: 'Results', href: '/trainer/results', icon: <BarChart3 className="w-4 h-4" /> },
];

export default function TrainerLayout({ children }) {
  return (
    <PortalShell
      title="Trainer Academic Console"
      allowedRoles={['TRAINER', 'ADMIN', 'SUPER_ADMIN']}
      navItems={TRAINER_NAV}
    >
      {children}
    </PortalShell>
  );
}
