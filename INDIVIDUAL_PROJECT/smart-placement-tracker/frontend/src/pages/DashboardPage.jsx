import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const isTpo = user.role === 'tpo';
  const isAdmin = user.role === 'admin';
  const headers = { Authorization: `Bearer ${user.token}` };

  const [stats, setStats] = useState({});
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [myApps, setMyApps] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/companies', { headers })
        .then(({ data }) => {
          setRecentCompanies(data.slice(0, 5));
          setStats({
            total: data.length,
            pending: data.filter(x => (x.approvalStatus || 'pending') === 'pending').length,
            approved: data.filter(x => x.approvalStatus === 'approved').length,
            rejected: data.filter(x => x.approvalStatus === 'rejected').length,
          });
        })
        .catch(() => {});
    } else if (isTpo) {
      Promise.all([
        api.get('/companies', { headers }),
        api.get('/students', { headers }),
      ])
        .then(([c, s]) => {
          setRecentCompanies(c.data.slice(0, 5));
          setStats({
            companies: c.data.length,
            active: c.data.filter(x => x.status === 'active').length,
            students: s.data.length,
            placed: s.data.filter(x => x.placedStatus).length,
          });
        })
        .catch(() => {});
    } else {
      Promise.all([
        api.get('/students/profile', { headers }),
        api.get('/applications/my', { headers }),
        api.get('/companies', { headers }),
      ])
        .then(([p, a, c]) => {
          setStudentProfile(p.data);
          setMyApps(a.data);
          setRecentCompanies(c.data.slice(0, 5));
        })
        .catch(() => {});
    }
  }, []);

  const statCards = isAdmin
    ? [
        { label: 'Total Requests', value: stats.total },
        { label: 'Pending Review', value: stats.pending },
        { label: 'Published', value: stats.approved },
        { label: 'Rejected', value: stats.rejected },
      ]
    : isTpo
    ? [
        { label: 'Companies', value: stats.companies },
        { label: 'Active Drives', value: stats.active },
        { label: 'Total Students', value: stats.students },
        { label: 'Placed', value: stats.placed },
      ]
    : [
        { label: 'Branch', value: studentProfile?.branch },
        { label: 'CGPA', value: studentProfile?.cgpa },
        { label: 'Applications', value: myApps.length },
        { label: 'Status', value: studentProfile?.placedStatus ? 'Placed' : 'Active' },
      ];

  const statusClass = status => {
    if (status === 'active' || status === 'approved') return 'chip';
    if (status === 'upcoming' || status === 'pending') return 'chip chip-warm';
    return 'chip chip-muted';
  };

  return (
    <div className="app-page">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main" style={{ maxWidth: 980 }}>
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user.name}</p>
          </div>

          <div className="stats-grid">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value ?? '-'}</div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 className="panel-title">{isAdmin ? 'Recent Drive Requests' : isTpo ? 'Recent Drives' : 'Available Drives'}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {isAdmin ? (
                  <Link to="/admin/approvals" className="btn btn-primary" style={{ minHeight: 32, padding: '5px 10px' }}>
                    Review Requests
                  </Link>
                ) : isTpo && (
                  <Link to="/companies/add" className="btn btn-primary" style={{ minHeight: 32, padding: '5px 10px' }}>
                    + Add Drive
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/companies" className="btn btn-secondary" style={{ minHeight: 32, padding: '5px 10px' }}>
                    View All
                  </Link>
                )}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Company', 'Role', 'Package', isAdmin ? 'Approval' : 'Status'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--muted-light)', fontSize: 13 }}>
                      No drives yet
                    </td>
                  </tr>
                ) : (
                  recentCompanies.map(c => (
                    <tr key={c._id}>
                      <td className="table-cell" style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="table-cell" style={{ color: 'var(--muted)' }}>{c.jobRole}</td>
                      <td className="table-cell" style={{ fontWeight: 600 }}>{c.package} LPA</td>
                      <td className="table-cell">
                        <span className={statusClass(isAdmin ? (c.approvalStatus || 'pending') : c.status)}>
                          {isAdmin ? (c.approvalStatus || 'pending') : c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
