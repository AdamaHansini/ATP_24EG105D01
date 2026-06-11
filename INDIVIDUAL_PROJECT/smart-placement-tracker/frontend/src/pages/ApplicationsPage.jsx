import { useEffect, useState } from 'react';
import api from '../api';
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

const statusLabels = {
  round1_pending: '🔄 Round 1 Review',
  round1_approved: '✅ Resume Approved',
  round1_rejected: '❌ Resume Rejected',
  round2_pending: '🔄 Round 2 In Progress',
  round2_approved: '✅ Round 2 Completed',
  round2_rejected: '❌ Round 2 Rejected',
  pending_placement: '⏳ Placement Pending',
  placed: '🎉 PLACED',
  rejected: '❌ NOT PLACED',
};

/* ─── Placement Notification Modal ─── */
const PlacementModal = ({ notification, onClose }) => {
  if (!notification) return null;
  const isPlaced = notification.status === 'placed';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: isPlaced
            ? 'linear-gradient(135deg, #0f2027 0%, #1a3a2a 50%, #0f2027 100%)'
            : 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 50%, #1a0a0a 100%)',
          border: isPlaced ? '1px solid #22c55e' : '1px solid #ef4444',
          borderRadius: 20,
          padding: '48px 40px',
          maxWidth: 460,
          width: '90%',
          textAlign: 'center',
          boxShadow: isPlaced
            ? '0 0 80px rgba(34,197,94,0.25), 0 25px 60px rgba(0,0,0,0.6)'
            : '0 0 80px rgba(239,68,68,0.2), 0 25px 60px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: -2, borderRadius: 22,
          background: isPlaced
            ? 'linear-gradient(135deg, #22c55e33, transparent, #22c55e33)'
            : 'linear-gradient(135deg, #ef444433, transparent, #ef444433)',
          zIndex: -1,
        }} />

        {/* Emoji */}
        <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>
          {isPlaced ? '🎉' : '💙'}
        </div>

        {/* Headline */}
        <h2 style={{
          fontSize: 26, fontWeight: 900, marginBottom: 8,
          color: isPlaced ? '#4ade80' : '#f87171',
          letterSpacing: '-0.5px',
        }}>
          {isPlaced ? 'Congratulations!' : 'Keep Going!'}
        </h2>

        {/* Sub-message */}
        <p style={{ fontSize: 15, color: '#cbd5e1', marginBottom: 20, lineHeight: 1.6 }}>
          {isPlaced
            ? <>You have been <strong style={{ color: '#4ade80' }}>successfully placed</strong> at</>
            : <>Your application at</>}
        </p>

        {/* Company name */}
        <div style={{
          background: isPlaced ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: isPlaced ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', marginBottom: 4 }}>
            {notification.companyName}
          </div>
          {notification.jobRole && (
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{notification.jobRole}</div>
          )}
          {isPlaced && notification.package && (
            <div style={{
              marginTop: 8, display: 'inline-block',
              background: 'rgba(34,197,94,0.2)', borderRadius: 8,
              padding: '4px 12px', fontSize: 14, fontWeight: 700, color: '#4ade80',
            }}>
              💰 {notification.package} LPA
            </div>
          )}
        </div>

        {/* Bottom message */}
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
          {isPlaced
            ? 'Your hard work and dedication have paid off. Wishing you a bright career ahead! 🌟'
            : "This isn't the end. Every experience is a stepping stone. More opportunities await you! 💪"}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: isPlaced
              ? 'linear-gradient(135deg, #16a34a, #22c55e)'
              : 'linear-gradient(135deg, #991b1b, #ef4444)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 40px', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', width: '100%',
            boxShadow: isPlaced
              ? '0 4px 20px rgba(34,197,94,0.4)'
              : '0 4px 20px rgba(239,68,68,0.3)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
        >
          {isPlaced ? '🎊 Awesome, Thank You!' : 'Got it, I\'ll keep trying!'}
        </button>

        {/* Decorative dots */}
        {isPlaced && (
          <>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 6, height: 6, borderRadius: '50%',
                background: ['#4ade80','#facc15','#60a5fa','#f472b6','#a78bfa','#34d399','#fb923c','#38bdf8'][i],
                top: `${10 + Math.random() * 20}%`,
                left: `${5 + i * 12}%`,
                opacity: 0.7,
                animation: `float ${2 + i * 0.3}s ease-in-out infinite alternate`,
              }} />
            ))}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes float { from { transform: translateY(0) } to { transform: translateY(-10px) } }
      `}</style>
    </div>
  );
};

/* ─── Main Page ─── */
const ApplicationsPage = () => {
  const user = JSON.parse(localStorage.getItem('spt_user') || '{}');
  const headers = { Authorization: `Bearer ${user.token}` };

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState(null);
  const [round2Answers, setRound2Answers] = useState(['', '']);
  const [submitting, setSubmitting] = useState(false);

  // Notification queue — one popup at a time
  const [notifQueue, setNotifQueue] = useState([]);
  const [currentNotif, setCurrentNotif] = useState(null);

  // Check for unseen placement decisions after applications load
  useEffect(() => {
    if (applications.length === 0) return;

    const finalStatuses = ['placed', 'rejected'];
    const unseen = [];

    applications.forEach(app => {
      if (!finalStatuses.includes(app.status)) return;
      const key = `spt_notified_${app._id}_${app.status}`;
      if (localStorage.getItem(key)) return; // already shown

      unseen.push({
        appId: app._id,
        status: app.status,
        companyName: app.companyId?.name || 'the company',
        jobRole: app.companyId?.jobRole,
        package: app.companyId?.package,
        key,
      });
    });

    if (unseen.length > 0) {
      setNotifQueue(unseen);
      setCurrentNotif(unseen[0]);
    }
  }, [applications]);

  const dismissNotif = () => {
    // Mark this notification as seen
    if (currentNotif) {
      localStorage.setItem(currentNotif.key, '1');
    }
    // Show next in queue
    const remaining = notifQueue.slice(1);
    setNotifQueue(remaining);
    setCurrentNotif(remaining[0] || null);
  };

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get('/applications/my', { headers });
        setApplications(data);
      } catch {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleRound2Submit = async (appId) => {
    if (round2Answers.some(a => !a.trim())) {
      toast.error('Please answer both questions');
      return;
    }

    setSubmitting(true);
    try {
      const answers = round2Answers.map((answer, questionIndex) => ({ questionIndex, answer }));
      await api.post(`/applications/${appId}/submit-round2`, { answers }, { headers });
      toast.success('Answers submitted!');
      setRound2Answers(['', '']);

      const { data } = await axios.get('/api/applications/my', { headers });
      setApplications(data);
      setActiveApp(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-page">
      {/* Placement result popup */}
      <PlacementModal notification={currentNotif} onClose={dismissNotif} />

      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="app-main">
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">{applications.length} application(s)</p>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">No applications yet</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {applications.map(app => (
                <div key={app._id} className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{app.companyId?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{app.companyId?.jobRole}</div>
                    </div>
                    <span
                      style={{
                        background: statusColors[app.status] || '#9ca3af',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {statusLabels[app.status] || app.status}
                    </span>
                  </div>

                  {/* Round 1 Status */}
                  <div style={{ padding: 12, background: 'var(--surface-muted)', borderRadius: 6, marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>🔍 Round 1: Resume Review</div>
                    {app.round1?.submittedAt && (
                      <>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>
                          Submitted: {new Date(app.round1.submittedAt).toLocaleString()}
                        </div>
                        {app.round1?.reviewedAt && (
                          <>
                            <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4 }}>
                              Status: <span style={{ fontWeight: 600 }}>{app.round1.approved ? '✅ Approved' : '❌ Rejected'}</span>
                            </div>
                            {app.round1?.tpoReviewNotes && (
                              <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4, padding: 8, background: 'var(--background)', borderRadius: 4, borderLeft: '3px solid var(--primary)' }}>
                                <strong>TPO Notes:</strong> {app.round1.tpoReviewNotes}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Round 2 Section */}
                  {(app.status.includes('round2') || app.status === 'pending_placement' || app.status === 'placed' || app.status === 'rejected') && (
                    <div style={{ padding: 12, background: 'var(--surface-muted)', borderRadius: 6, marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>💬 Round 2: HR Questions</div>

                      {app.status === 'round2_pending' && (
                        <div>
                          {activeApp === app._id ? (
                            <div>
                              {app.round2?.questions?.map((q, idx) => (
                                <div key={idx} style={{ marginBottom: 12 }}>
                                  <label className="label" htmlFor={`q${idx}`}>Q{idx + 1}: {q}</label>
                                  <textarea
                                    id={`q${idx}`}
                                    className="input"
                                    rows="4"
                                    placeholder="Your answer..."
                                    value={round2Answers[idx]}
                                    onChange={e => {
                                      const newAnswers = [...round2Answers];
                                      newAnswers[idx] = e.target.value;
                                      setRound2Answers(newAnswers);
                                    }}
                                  />
                                </div>
                              ))}
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleRound2Submit(app._id)}
                                  disabled={submitting}
                                  className="btn btn-primary"
                                  style={{ flex: 1 }}
                                >
                                  {submitting ? 'Submitting...' : 'Submit Answers'}
                                </button>
                                <button
                                  onClick={() => { setActiveApp(null); setRound2Answers(['', '']); }}
                                  className="btn btn-secondary"
                                  style={{ flex: 1 }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveApp(app._id)}
                              className="btn btn-primary"
                              style={{ width: '100%' }}
                            >
                              Click to Answer Questions
                            </button>
                          )}
                        </div>
                      )}

                      {app.round2?.answers && app.round2.answers.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>
                            Submitted: {new Date(app.round2.submittedAt).toLocaleString()}
                          </div>
                          {app.round2.answers.map((ans, idx) => (
                            <div key={idx} style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Your Answer to Q{idx + 1}:</div>
                              <div style={{ fontSize: 12, color: 'var(--text)', padding: 8, background: 'var(--background)', borderRadius: 4 }}>
                                {ans.answer}
                              </div>
                            </div>
                          ))}
                          {app.round2?.evaluatedAt && (
                            <div style={{ padding: 8, background: 'var(--background)', borderRadius: 4, borderLeft: '3px solid var(--primary)', marginTop: 8 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>TPO Evaluation:</div>
                              <div style={{ fontSize: 12 }}>
                                Status: <span style={{ fontWeight: 600 }}>{app.round2.approved ? '✅ Approved' : '❌ Rejected'}</span>
                              </div>
                              {app.round2?.tpoEvaluationNotes && (
                                <div style={{ fontSize: 12, marginTop: 4 }}>{app.round2.tpoEvaluationNotes}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Decision */}
                  {(app.status === 'placed' || app.status === 'rejected' || app.status === 'pending_placement') && (
                    <div style={{ padding: 12, background: 'var(--surface-muted)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>📋 Final Decision</div>
                      <div style={{ fontSize: 12 }}>
                        Status: <span style={{ fontWeight: 600, color: app.status === 'placed' ? '#10b981' : '#ef4444' }}>
                          {app.status === 'placed' ? '🎉 PLACED' : app.status === 'pending_placement' ? '⏳ Pending' : '❌ NOT PLACED'}
                        </span>
                      </div>
                      {app.placementNotes && (
                        <div style={{ fontSize: 12, marginTop: 8, padding: 8, background: 'var(--background)', borderRadius: 4 }}>
                          {app.placementNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ApplicationsPage;
