'use client';

import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  BookOpen,
  Layers,
  Users,
  FileText,
  ClipboardCheck,
  Award,
  BarChart3,
  BadgeCheck,
  LineChart,
  Globe,
} from 'lucide-react';
import PortalShell from '../../components/shared/PortalShell';

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Analytics & Alerts', href: '/admin/analytics', icon: <LineChart className="w-4 h-4" /> },
  { label: 'Website CMS', href: '/admin/cms', icon: <Globe className="w-4 h-4" /> },
  { label: 'OTR Verification', href: '/admin/otr', icon: <UserCheck className="w-4 h-4" /> },
  { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Batches & Enroll', href: '/admin/batches', icon: <Layers className="w-4 h-4" /> },
  { label: 'Attendance', href: '/admin/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
  { label: 'Assessments', href: '/admin/assessments', icon: <Award className="w-4 h-4" /> },
  { label: 'Results', href: '/admin/results', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Certificates', href: '/admin/certificates', icon: <BadgeCheck className="w-4 h-4" /> },
  { label: 'Users & Trainers', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText className="w-4 h-4" /> },
];

export default function AdminLayout({ children }) {
  return (
    <PortalShell
      title="Admin Control Hub"
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
      navItems={ADMIN_NAV}
    >
      {children}
    </PortalShell>
  );
}
