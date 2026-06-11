import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const approvalClass = status => {
  if (status === 'approved') return 'chip';
  if (status === 'rejected') return 'chip chip-muted';
  return 'chip chip-warm';
};

const AdminApprovalsPage = () => {
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const headers = { Authorization: `Bearer ${user.token}` };
  const [companies, setCompanies] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/companies', { headers });
      setCompanies(data);
    } catch {
      toast.error('Failed to load drive requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return companies;
    return companies.filter(company => (company.approvalStatus || 'pending') === filter);
  }, [companies, filter]);

  const counts = useMemo(() => ({
    pending: companies.filter(c => (c.approvalStatus || 'pending') === 'pending').length,
    approved: companies.filter(c => c.approvalStatus === 'approved').length,
    rejected: companies.filter(c => c.approvalStatus === 'rejected').length,
  }), [companies]);

  const approveDrive = async id => {
    setBusyId(id);
    try {
      const { data } = await axios.put(`/api/companies/${id}/approve`, {}, { headers });
      setCompanies(prev => prev.map(company => company._id === id ? { ...data.company, createdBy: company.createdBy } : company));
      toast.success('Drive published to students');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approve failed');
    } finally {
      setBusyId('');
    }
  };

  const rejectDrive = async id => {
    const reason = window.prompt('Reason for rejection (optional)') || '';
    setBusyId(id);
    try {
      const { data } = await axios.put(`/api/companies/${id}/reject`, { reason }, { headers });
      setCompanies(prev => prev.map(company => company._id === id ? { ...data.company, createdBy: company.createdBy } : company));
      toast.success('Drive rejected');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reject failed');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="app-page">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          <div className="page-header">
            <h1 className="page-title">Drive Approvals</h1>
            <p className="page-subtitle">Review TPO-submitted drives before students can view or apply.</p>
          </div>

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            {[
              { label: 'Pending Review', value: counts.pending },
              { label: 'Published', value: counts.approved },
              { label: 'Rejected', value: counts.rejected },
            ].map(item => (
              <div key={item.label} className="stat-card">
                <div className="stat-label">{item.label}</div>
                <div className="stat-value">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="toolbar">
            {['pending', 'approved', 'rejected', 'all'].map(value => (
              <button
                key={value}
                type="button"
                className={filter === value ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => setFilter(value)}
              >
                {value === 'all' ? 'All' : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No drive requests in this view</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {filtered.map(company => {
                const date = new Date(company.recruitmentDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const approvalStatus = company.approvalStatus || 'pending';

                return (
                  <div key={company._id} className="panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{company.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{company.jobRole}</div>
                      </div>
                      <span className={approvalClass(approvalStatus)}>{approvalStatus}</span>
                    </div>

                    <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>
                      {company.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
                      <div><span className="stat-label">Package</span><div style={{ fontWeight: 800 }}>{company.package} LPA</div></div>
                      <div><span className="stat-label">Min CGPA</span><div style={{ fontWeight: 800 }}>{company.minCGPA}</div></div>
                      <div><span className="stat-label">Drive Date</span><div style={{ fontWeight: 800 }}>{date}</div></div>
                      <div><span className="stat-label">Submitted By</span><div style={{ fontWeight: 800 }}>{company.createdBy?.name || 'TPO'}</div></div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                      {company.eligibleBranches.map(branch => <span key={branch} className="chip chip-muted">{branch}</span>)}
                    </div>

                    {company.rejectionReason && (
                      <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 12 }}>{company.rejectionReason}</p>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busyId === company._id || approvalStatus === 'approved'}
                        onClick={() => approveDrive(company._id)}
                        style={{ flex: 1 }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={busyId === company._id || approvalStatus === 'rejected'}
                        onClick={() => rejectDrive(company._id)}
                        style={{ flex: 1 }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminApprovalsPage;
