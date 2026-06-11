import { Link, useLocation } from 'react-router-dom';
import { Building2, ClipboardList, LayoutDashboard, PlusCircle, UserRoundCheck, UsersRound } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const isTpo = user.role === 'tpo';
  const isAdmin = user.role === 'admin';

  const links = isAdmin
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/approvals', label: 'Drive Approvals', icon: ClipboardList },
      ]
    : isTpo
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/companies', label: 'Companies', icon: Building2 },
        { to: '/companies/add', label: 'Add Drive', icon: PlusCircle },
        { to: '/students', label: 'Students', icon: UsersRound },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/companies', label: 'Browse Drives', icon: Building2 },
        { to: '/applications', label: 'My Applications', icon: ClipboardList },
      ];

  return (
    <aside className="side-nav">
      <div style={{ padding: '0 10px 12px', marginBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-dark)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
          <UserRoundCheck size={15} />
          {isAdmin ? 'Admin Console' : isTpo ? 'TPO Console' : 'Student Portal'}
        </div>
      </div>
      {links.map(l => {
        const active = location.pathname === l.to;
        const Icon = l.icon;
        return (
          <Link key={l.to} to={l.to} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
            <Icon size={16} strokeWidth={active ? 2.5 : 2} />
            {l.label}
          </Link>
        );
      })}
    </aside>
  );
};

export default Sidebar;
