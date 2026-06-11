import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', rollNumber: '', branch: 'CSE', cgpa: '', phone: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', { ...form, cgpa: form.role === 'student' ? Number(form.cgpa) : undefined });
      localStorage.setItem('spt_user', JSON.stringify(data));
      toast.success('Registered!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>Create Account</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Smart Placement Tracker</p>

        {/* Role toggle */}
        <div style={{ display: 'flex', background: 'var(--surface-muted)', border: '1px solid var(--border)', borderRadius: 6, padding: 3, marginBottom: 20, gap: 3 }}>
          {['student', 'tpo'].map(r => (
            <button key={r} type="button" onClick={() => set('role', r)}
              style={{ flex: 1, padding: '6px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 4, cursor: 'pointer',
                background: form.role === r ? '#fff' : 'transparent',
                color: form.role === r ? 'var(--primary-dark)' : 'var(--muted)' }}>
              {r === 'tpo' ? 'TPO Officer' : 'Student'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label" htmlFor="reg-name">Full Name *</label>
              <input id="reg-name" className="input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="reg-email">Email *</label>
              <input id="reg-email" className="input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="reg-password">Password *</label>
              <input id="reg-password" className="input" type="password" placeholder="Min 6 chars" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="reg-phone">Phone</label>
              <input id="reg-phone" className="input" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          {form.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12, padding: 12, background: 'var(--surface-muted)', borderRadius: 6, border: '1px solid var(--border)' }}>
              <div>
                <label className="label" htmlFor="reg-roll">Roll No *</label>
                <input id="reg-roll" className="input" placeholder="22CS001" value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} required />
              </div>
              <div>
                <label className="label" htmlFor="reg-branch">Branch *</label>
                <select id="reg-branch" className="input" value={form.branch} onChange={e => set('branch', e.target.value)}>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="reg-cgpa">CGPA *</label>
                <input id="reg-cgpa" className="input" type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} required />
              </div>
            </div>
          )}

          <button id="register-submit-btn" type="submit" disabled={loading} className="btn btn-primary"
            style={{ width: '100%' }}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
          Have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-dark)', textDecoration: 'none', fontWeight: 700 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
