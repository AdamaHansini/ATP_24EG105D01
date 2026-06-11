import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const CompanyCard = ({ company, onApply, isStudent, hasApplied }) => {
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const headers = { Authorization: `Bearer ${user.token}` };

  const date = new Date(company.recruitmentDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statusClass = company.status === 'active'
    ? 'chip'
    : company.status === 'upcoming'
    ? 'chip chip-warm'
    : 'chip chip-muted';

  const approvalStatus = company.approvalStatus || 'approved';
  const approvalClass = approvalStatus === 'approved'
    ? 'chip'
    : approvalStatus === 'pending'
    ? 'chip chip-warm'
    : 'chip chip-muted';

  const handleSubmitResume = async () => {
    if (!resumeUrl.trim()) {
      toast.error('Please provide resume URL');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`/api/students/apply/${company._id}`, { resumeUrl }, { headers });
      toast.success('Resume submitted! Waiting for TPO review.');
      setShowResumeUpload(false);
      setResumeUrl('');
      if (onApply) onApply(company._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{company.name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{company.jobRole}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column', gap: 5 }}>
          <span className={statusClass}>{company.status}</span>
          {approvalStatus !== 'approved' && <span className={approvalClass}>{approvalStatus}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text)' }}>Package: <b>{company.package} LPA</b></div>
        <div style={{ fontSize: 12, color: 'var(--text)' }}>Min CGPA: <b>{company.minCGPA}</b></div>
        <div style={{ fontSize: 12, color: 'var(--muted)', gridColumn: 'span 2' }}>Drive date: {date}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {company.eligibleBranches.map(b => (
          <span key={b} className="chip">{b}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Link
          to={`/companies/${company._id}`}
          id={`view-company-${company._id}`}
          className="btn btn-secondary"
          style={{ flex: 1, justifyContent: 'center', padding: '7px', textDecoration: 'none' }}
        >
          View Details
        </Link>
        {isStudent && (
          <button
            id={`apply-company-${company._id}`}
            onClick={() => setShowResumeUpload(true)}
            disabled={hasApplied || company.status === 'closed'}
            className={hasApplied || company.status === 'closed' ? 'btn btn-secondary' : 'btn btn-primary'}
            style={{ flex: 1, justifyContent: 'center', padding: '7px' }}
          >
            {hasApplied ? 'Applied' : company.status === 'closed' ? 'Closed' : 'Upload Resume'}
          </button>
        )}
      </div>

      {showResumeUpload && isStudent && (
        <div style={{ padding: 12, background: 'var(--surface-muted)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <label className="label" htmlFor={`resume-${company._id}`}>Resume URL (Drive/Drive link)</label>
          <input
            id={`resume-${company._id}`}
            className="input"
            placeholder="https://drive.google.com/..."
            value={resumeUrl}
            onChange={e => setResumeUrl(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleSubmitResume}
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Resume'}
            </button>
            <button
              onClick={() => { setShowResumeUpload(false); setResumeUrl(''); }}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyCard;
