import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const isTpo = user.role === 'tpo';
  const isAdmin = user.role === 'admin';

  const links = isAdmin
    ? [{ to: '/dashboard', label: 'Dashboard' }, { to: '/admin/approvals', label: 'Approvals' }]
    : isTpo
    ? [{ to: '/dashboard', label: 'Dashboard' }, { to: '/companies', label: 'Companies' }, { to: '/students', label: 'Students' }]
    : [{ to: '/dashboard', label: 'Dashboard' }, { to: '/companies', label: 'Drives' }, { to: '/applications', label: 'My Applications' }];

  return (
    <nav className="shell-nav" style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span className="brand-mark" style={{ width: 32, height: 32 }}>
            <BriefcaseBusiness size={18} strokeWidth={2.3} />
          </span>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: 0 }}>SmartPlacement</span>
        </Link>
        <div style={{ display: 'flex', gap: 6 }}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'nav-link-active' : ''}`}
              style={{ marginBottom: 0, padding: '7px 12px' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>{user.role}</div>
        </div>
        <button id="logout-btn" onClick={() => { localStorage.removeItem('spt_user'); navigate('/login'); }}
          title="Logout"
          className="btn btn-danger"
          style={{ height: 34, width: 34, minHeight: 34, padding: 0 }}>
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
