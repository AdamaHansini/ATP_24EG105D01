import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentRow from '../components/StudentRow';

const BRANCHES = ['All', 'CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

const StudentsPage = () => {
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const headers = { Authorization: `Bearer ${user.token}` };

  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [placedFilter, setPlacedFilter] = useState('all');
  const [minCGPA, setMinCGPA] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/students', { headers })
      .then(res => { setStudents(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let r = [...students];
    if (search) r = r.filter(s => s.userId?.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase()));
    if (branchFilter !== 'All') r = r.filter(s => s.branch === branchFilter);
    if (placedFilter === 'placed') r = r.filter(s => s.placedStatus);
    if (placedFilter === 'notplaced') r = r.filter(s => !s.placedStatus);
    if (minCGPA) r = r.filter(s => s.cgpa >= Number(minCGPA));
    setFiltered(r);
  }, [search, branchFilter, placedFilter, minCGPA, students]);

  const placedCount = students.filter(s => s.placedStatus).length;

  return (
    <div className="app-page">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          <div style={{ marginBottom: 16 }}>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">{students.length} total · {placedCount} placed</p>
          </div>

          {/* Summary */}
          <div className="metric-grid">
            {[
              { label: 'Total', value: students.length },
              { label: 'Placed', value: placedCount },
              { label: 'Not Placed', value: students.length - placedCount },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="toolbar" style={{ marginBottom: 12 }}>
            <input id="student-search" className="input" style={{ flex: 1, minWidth: 180 }} placeholder="Search by name or roll no..." value={search} onChange={e => setSearch(e.target.value)} />
            <select id="student-branch-filter" className="input" style={{ width: 'auto' }} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
            <select id="student-placed-filter" className="input" style={{ width: 'auto' }} value={placedFilter} onChange={e => setPlacedFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="placed">Placed</option>
              <option value="notplaced">Not Placed</option>
            </select>
            <input id="student-cgpa-filter" className="input" style={{ width: 110 }} type="number" min="0" max="10" step="0.1" placeholder="Min CGPA" value={minCGPA} onChange={e => setMinCGPA(e.target.value)} />
          </div>

          {/* Table */}
          <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Student', 'Roll No', 'Branch', 'CGPA', 'Placement'].map(h => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted-light)' }}>Loading...</td></tr>
                  : filtered.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted-light)' }}>No students found</td></tr>
                  : filtered.map(s => <StudentRow key={s._id} student={s} showRound={false} />)
                }
              </tbody>
            </table>
            <div style={{ padding: '10px 12px', fontSize: 11, color: 'var(--muted)' }}>Showing {filtered.length} of {students.length}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentsPage;
