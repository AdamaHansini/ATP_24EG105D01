import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ALL_BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

const AddCompanyPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const headers = { Authorization: `Bearer ${user.token}` };
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', jobRole: '', package: '', minCGPA: '', recruitmentDate: '', location: 'On Campus', status: 'upcoming', eligibleBranches: [] });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleBranch = b => setForm(p => ({ ...p, eligibleBranches: p.eligibleBranches.includes(b) ? p.eligibleBranches.filter(x => x !== b) : [...p.eligibleBranches, b] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.eligibleBranches.length === 0) return toast.error('Select at least one branch');
    setLoading(true);
    try {
      await axios.post('/api/companies', { ...form, package: Number(form.package), minCGPA: Number(form.minCGPA) }, { headers });
      toast.success('Drive submitted for admin approval!');
      navigate('/companies');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-page">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main" style={{ maxWidth: 760 }}>
          <Link to="/companies" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-block', marginBottom: 16, fontWeight: 700 }}>← Back</Link>
          <div className="page-header">
            <h1 className="page-title">Add Recruitment Drive</h1>
            <p className="page-subtitle">Create a new company placement drive</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Company Info */}
            <div className="panel" style={{ marginBottom: 12 }}>
              <h2 className="panel-title" style={{ marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>Company Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label" htmlFor="add-name">Company Name *</label>
                  <input id="add-name" className="input" placeholder="e.g. Google" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div>
                  <label className="label" htmlFor="add-role">Job Role *</label>
                  <input id="add-role" className="input" placeholder="e.g. Software Engineer" value={form.jobRole} onChange={e => set('jobRole', e.target.value)} required />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label" htmlFor="add-desc">Description *</label>
                  <textarea id="add-desc" className="input" rows={3} style={{ resize: 'none' }} placeholder="Describe the company and role..." value={form.description} onChange={e => set('description', e.target.value)} required />
                </div>
                <div>
                  <label className="label" htmlFor="add-location">Location</label>
                  <input id="add-location" className="input" placeholder="On Campus / City" value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="add-status">Status</label>
                  <select id="add-status" className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Eligibility */}
            <div className="panel" style={{ marginBottom: 16 }}>
              <h2 className="panel-title" style={{ marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid var(--border-soft)' }}>Eligibility</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="label" htmlFor="add-package">Package (LPA) *</label>
                  <input id="add-package" className="input" type="number" min="0" step="0.5" placeholder="12" value={form.package} onChange={e => set('package', e.target.value)} required />
                </div>
                <div>
                  <label className="label" htmlFor="add-cgpa">Min CGPA *</label>
                  <input id="add-cgpa" className="input" type="number" min="0" max="10" step="0.1" placeholder="7.5" value={form.minCGPA} onChange={e => set('minCGPA', e.target.value)} required />
                </div>
                <div>
                  <label className="label" htmlFor="add-date">Date *</label>
                  <input id="add-date" className="input" type="date" value={form.recruitmentDate} onChange={e => set('recruitmentDate', e.target.value)} required />
                </div>
              </div>

              <label className="label">Eligible Branches * <span style={{ color: 'var(--muted-light)' }}>(click to select)</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {ALL_BRANCHES.map(b => {
                  const sel = form.eligibleBranches.includes(b);
                  return (
                    <button type="button" key={b} id={`branch-toggle-${b}`} onClick={() => toggleBranch(b)}
                      style={{ padding: '4px 12px', fontSize: 12, borderRadius: 5, cursor: 'pointer', fontWeight: sel ? 600 : 400,
                        background: sel ? 'var(--primary-soft)' : 'var(--surface-muted)', color: sel ? 'var(--primary-dark)' : 'var(--text)',
                        border: sel ? '1px solid #bfdbfe' : '1px solid var(--border)' }}>
                      {b}
                    </button>
                  );
                })}
              </div>
              {form.eligibleBranches.length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--primary-dark)', marginTop: 6, fontWeight: 700 }}>{form.eligibleBranches.length} branch(es) selected</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button id="add-company-submit" type="submit" disabled={loading} className="btn btn-primary"
                style={{ flex: 1 }}>
                {loading ? 'Creating...' : 'Create Drive'}
              </button>
              <Link to="/companies" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddCompanyPage;
