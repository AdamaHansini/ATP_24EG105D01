import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CompanyCard from '../components/CompanyCard';

const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

const CompaniesPage = () => {
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const isTpo = user.role === 'tpo';
  const isStudent = user.role === 'student';
  const headers = { Authorization: `Bearer ${user.token}` };

  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('All');
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('/api/companies', { headers });
        setCompanies(data); 
        setFiltered(data);
        
        if (isStudent) {
          const appRes = await axios.get('/api/applications/my', { headers });
          setAppliedIds(appRes.data.map(a => a.companyId._id || a.companyId));
        }
      } catch { 
        toast.error('Failed to load drives'); 
      }
      finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    let r = [...companies];
    if (search) r = r.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.jobRole.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') r = r.filter(c => c.status === statusFilter);
    if (branchFilter !== 'All') r = r.filter(c => c.eligibleBranches.includes(branchFilter));
    setFiltered(r);
  }, [search, statusFilter, branchFilter, companies]);

  const handleApply = (companyId) => {
    setAppliedIds(p => [...p, companyId]);
  };

  return (
    <div className="app-page">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 className="page-title">Placement Drives</h1>
              <p className="page-subtitle">{filtered.length} drive(s)</p>
            </div>
            {isTpo && <Link to="/companies/add" className="btn btn-primary">+ Add Drive</Link>}
          </div>

          {/* Filters */}
          <div className="toolbar">
            <input id="company-search" className="input" style={{ flex: 1, minWidth: 180 }} placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)} />
            <select id="status-filter" className="input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
            <select id="branch-filter" className="input" style={{ width: 'auto' }} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No drives found</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(c => (
                <CompanyCard key={c._id} company={c} isStudent={isStudent} hasApplied={appliedIds.includes(c._id)} onApply={handleApply} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CompaniesPage;
