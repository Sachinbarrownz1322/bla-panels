'use client';

import React from 'react';
import { LayoutDashboard, User, Layers, FileText, Settings, ClipboardCheck, Award, BarChart3, BadgeCheck } from 'lucide-react';
import PortalShell from '../../components/shared/PortalShell';

const STUDENT_NAV = [
  { label: 'Dashboard', href: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'OTR & Profile', href: '/student/profile', icon: <User className="w-4 h-4" /> },
  { label: 'Batches & Timetable', href: '/student/batches', icon: <Layers className="w-4 h-4" /> },
  { label: 'Attendance', href: '/student/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: 'Assessments', href: '/student/assessments', icon: <Award className="w-4 h-4" /> },
  { label: 'Results', href: '/student/results', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Certificates', href: '/student/certificates', icon: <BadgeCheck className="w-4 h-4" /> },
  { label: 'Documents', href: '/student/documents', icon: <FileText className="w-4 h-4" /> },
  { label: 'Account Settings', href: '/student/settings', icon: <Settings className="w-4 h-4" /> },
];

export default function StudentLayout({ children }) {
  return (
    <PortalShell
      title="Student Learning Portal"
      allowedRoles={['STUDENT', 'ADMIN', 'SUPER_ADMIN']}
      navItems={STUDENT_NAV}
    >
      {children}
    </PortalShell>
  );
}
