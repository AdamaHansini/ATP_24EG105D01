import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      localStorage.setItem('spt_user', JSON.stringify(data));
      toast.success(`Welcome, ${data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 390 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span className="brand-mark" style={{ width: 40, height: 40 }}>
            <GraduationCap size={22} />
          </span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Sign In</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Smart Placement Tracker</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                title={showPass ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 18, textAlign: 'center' }}>
          No account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-dark)', textDecoration: 'none', fontWeight: 700 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
