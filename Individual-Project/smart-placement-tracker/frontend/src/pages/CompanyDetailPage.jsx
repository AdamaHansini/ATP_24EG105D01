import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const statusColors = {
  round1_pending: '#f59e0b',
  round1_approved: '#10b981',
  round1_rejected: '#ef4444',
  round2_pending: '#f59e0b',
  round2_approved: '#10b981',
  round2_rejected: '#ef4444',
  pending_placement: '#3b82f6',
  placed: '#10b981',
  rejected: '#ef4444',
};

const CompanyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const isTpo = user.role === 'tpo';
  const headers = { Authorization: `Bearer ${user.token}` };

  const [company, setCompany] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedApp, setExpandedApp] = useState(null);
  const [reviewState, setReviewState] = useState({});
  const [round2State, setRound2State] = useState({});
  const [placementState, setPlacementState] = useState({});
  const [busyId, setBusyId] = useState(null); // tracks which app is being actioned

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/companies/${id}`, { headers });
        setCompany(data);
        if (isTpo) {
          const a = await axios.get(`/api/applications/company/${id}`, { headers });
          setApplications(a.data);
        }
      } catch { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this drive?')) return;
    try { await axios.delete(`/api/companies/${id}`, { headers }); toast.success('Deleted'); navigate('/companies'); }
    catch { toast.error('Delete failed'); }
  };

  const handleReviewRound1 = async (appId, approved) => {
    const notes = reviewState[appId]?.notes || '';
    setBusyId(appId);
    try {
      const r1 = await axios.put(`/api/applications/${appId}/review-round1`, { approved, notes }, { headers });
      toast.success(approved ? 'Resume approved! Inviting to Round 2...' : 'Resume rejected');
      let updatedApp = r1.data.application;
      // If approved, invite to Round 2 and use that response
      if (approved) {
        const r2 = await axios.put(`/api/applications/${appId}/invite-round2`, {}, { headers });
        updatedApp = r2.data.application;
      }
      // Patch local state — no extra GET needed
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, ...updatedApp } : a));
      setExpandedApp(null);
      setReviewState(prev => ({ ...prev, [appId]: {} }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleEvaluateRound2 = async (appId, approved) => {
    const notes = round2State[appId]?.notes || '';
    setBusyId(appId);
    try {
      const { data } = await axios.put(`/api/applications/${appId}/evaluate-round2`, { approved, notes }, { headers });
      toast.success(approved ? 'Moved to pending placement' : 'Rejected after Round 2');
      // Patch local state — no extra GET needed
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, ...data.application } : a));
      setExpandedApp(null);
      setRound2State(prev => ({ ...prev, [appId]: {} }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleFinalDecision = async (appId, placed) => {
    const notes = placementState[appId]?.notes || '';
    setBusyId(appId);
    try {
      const { data } = await axios.put(`/api/applications/${appId}/final-decision`, { placed, notes }, { headers });
      toast.success(placed ? '🎉 Student Placed!' : 'Student not placed');
      // Patch local state — no extra GET needed
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, ...data.application } : a));
      setExpandedApp(null);
      setPlacementState(prev => ({ ...prev, [appId]: {} }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="app-page" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>;
  if (!company) return null;

  const date = new Date(company.recruitmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const statsData = {
    round1_pending: applications.filter(a => a.status === 'round1_pending').length,
    round1_approved: applications.filter(a => a.status === 'round1_approved').length,
    round1_rejected: applications.filter(a => a.status === 'round1_rejected').length,
    round2_pending: applications.filter(a => a.status === 'round2_pending').length,
    pending_placement: applications.filter(a => a.status === 'pending_placement').length,
    placed: applications.filter(a => a.status === 'placed').length,
  };

  return (
    <div className="app-page">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main" style={{ maxWidth: 1000 }}>
          <Link to="/companies" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', display: 'inline-block', marginBottom: 16, fontWeight: 700 }}>← Back to Drives</Link>

          {/* Company info card */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{company.name}</h1>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{company.jobRole}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={company.status === 'active' ? 'chip' : company.status === 'upcoming' ? 'chip chip-warm' : 'chip chip-muted'}>
                  {company.status}
                </span>
                {isTpo && (
                  <button id={`delete-company-${id}`} onClick={handleDelete} className="btn btn-danger"
                    style={{ minHeight: 28, padding: '3px 10px' }}>
                    Delete
                  </button>
                )}
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 14, lineHeight: 1.6 }}>{company.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
              {[
                { label: 'Package', value: `${company.package} LPA` },
                { label: 'Min CGPA', value: company.minCGPA },
                { label: 'Date', value: date },
                { label: 'Location', value: company.location || 'On Campus' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2, fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {company.eligibleBranches.map(b => (
                <span key={b} className="chip">{b}</span>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          {isTpo && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Pending Review', count: statsData.round1_pending, color: '#f59e0b' },
                { label: 'R1 Approved', count: statsData.round1_approved, color: '#10b981' },
                { label: 'R1 Rejected', count: statsData.round1_rejected, color: '#ef4444' },
                { label: 'R2 Pending', count: statsData.round2_pending, color: '#f59e0b' },
                { label: 'Placement Pending', count: statsData.pending_placement, color: '#3b82f6' },
                { label: 'Placed', count: statsData.placed, color: '#10b981' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-soft)', borderRadius: 6, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Applications List */}
          {isTpo && (
            <div className="panel">
              <h2 className="panel-title" style={{ marginBottom: 14 }}>Applications ({applications.length})</h2>

              {applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted-light)', fontSize: 13 }}>No applicants yet</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {applications.map(app => (
                    <div key={app._id} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12, cursor: 'pointer' }} onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{app.studentId?.userId?.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{app.studentId?.rollNumber} · {app.studentId?.branch} · CGPA: {app.studentId?.cgpa}</div>
                          </div>
                        </div>
                        <span style={{ background: statusColors[app.status], color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {app.status}
                        </span>
                      </div>

                      {/* Expanded view */}
                      {expandedApp === app._id && (
                        <div
                          style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Round 1 Review */}
                          {app.status === 'round1_pending' && (
                            <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface-muted)', borderRadius: 6 }}>
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>🔍 Review Round 1 Resume</div>
                              <div style={{ fontSize: 12, marginBottom: 8 }}>
                                <a href={app.round1?.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                  View Resume
                                </a>
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <label className="label">Review Notes (optional)</label>
                                <textarea
                                  className="input"
                                  rows="3"
                                  placeholder="Add your review notes..."
                                  value={reviewState[app._id]?.notes || ''}
                                  onChange={e => setReviewState(prev => ({ ...prev, [app._id]: { notes: e.target.value } }))}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleReviewRound1(app._id, true)}
                                  disabled={busyId === app._id}
                                  className="btn btn-primary"
                                  style={{ flex: 1 }}
                                >
                                  {busyId === app._id ? '⏳ Processing...' : '✅ Approve'}
                                </button>
                                <button
                                  onClick={() => handleReviewRound1(app._id, false)}
                                  disabled={busyId === app._id}
                                  className="btn btn-danger"
                                  style={{ flex: 1 }}
                                >
                                  {busyId === app._id ? '⏳ Processing...' : '❌ Reject'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Round 2 Evaluation */}
                          {app.status === 'round2_approved' && app.round2?.answers?.length > 0 && (
                            <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface-muted)', borderRadius: 6 }}>
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>💬 Evaluate Round 2 Answers</div>
                              {app.round2.questions.map((q, idx) => (
                                <div key={idx} style={{ marginBottom: 12 }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Q{idx + 1}: {q}</div>
                                  <div style={{ fontSize: 12, padding: 8, background: 'var(--background)', borderRadius: 4, marginBottom: 4 }}>
                                    {app.round2.answers[idx]?.answer}
                                  </div>
                                </div>
                              ))}
                              <div style={{ marginBottom: 8 }}>
                                <label className="label">Evaluation Notes (optional)</label>
                                <textarea
                                  className="input"
                                  rows="3"
                                  placeholder="Add your evaluation notes..."
                                  value={round2State[app._id]?.notes || ''}
                                  onChange={e => setRound2State(prev => ({ ...prev, [app._id]: { notes: e.target.value } }))}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleEvaluateRound2(app._id, true)}
                                  disabled={busyId === app._id}
                                  className="btn btn-primary"
                                  style={{ flex: 1 }}
                                >
                                  {busyId === app._id ? '⏳ Processing...' : '✅ Approve'}
                                </button>
                                <button
                                  onClick={() => handleEvaluateRound2(app._id, false)}
                                  disabled={busyId === app._id}
                                  className="btn btn-danger"
                                  style={{ flex: 1 }}
                                >
                                  {busyId === app._id ? '⏳ Processing...' : '❌ Reject'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Final Placement Decision */}
                          {app.status === 'pending_placement' && (
                            <div style={{ marginBottom: 16, padding: 12, background: 'var(--surface-muted)', borderRadius: 6 }}>
                              <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 Final Placement Decision</div>
                              <div style={{ marginBottom: 8 }}>
                                <label className="label">Decision Notes (optional)</label>
                                <textarea
                                  className="input"
                                  rows="3"
                                  placeholder="Add placement decision notes..."
                                  value={placementState[app._id]?.notes || ''}
                                  onChange={e => setPlacementState(prev => ({ ...prev, [app._id]: { notes: e.target.value } }))}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleFinalDecision(app._id, true)}
                                  disabled={busyId === app._id}
                                  className="btn btn-primary"
                                  style={{ flex: 1 }}
                                >
                                  {busyId === app._id ? '⏳ Processing...' : '🎉 Place Student'}
                                </button>
                                <button
                                  onClick={() => handleFinalDecision(app._id, false)}
                                  disabled={busyId === app._id}
                                  className="btn btn-danger"
                                  style={{ flex: 1 }}
                                >
                                  {busyId === app._id ? '⏳ Processing...' : "❌ Don't Place"}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Status summary */}
                          {app.round1?.reviewedAt && (
                            <div style={{ padding: 8, background: 'var(--background)', borderRadius: 4, fontSize: 12 }}>
                              <div><strong>Round 1:</strong> {app.round1.approved ? '✅ Approved' : '❌ Rejected'}</div>
                              {app.round1.tpoReviewNotes && <div>Notes: {app.round1.tpoReviewNotes}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CompanyDetailPage;
