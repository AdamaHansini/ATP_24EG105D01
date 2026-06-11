const ROUND_CONFIG = {
  applied: { label: 'Applied', bg: 'var(--primary-soft)', color: 'var(--primary-dark)' },
  round1: { label: 'Round 1', bg: 'var(--warning-soft)', color: 'var(--warning)' },
  round2: { label: 'Round 2', bg: '#ffedd5', color: '#9a3412' },
  selected: { label: 'Selected', bg: 'var(--success-soft)', color: 'var(--success)' },
  rejected: { label: 'Rejected', bg: 'var(--danger-soft)', color: '#b91c1c' },
};

const RoundBadge = ({ round }) => {
  const c = ROUND_CONFIG[round] || ROUND_CONFIG.applied;
  return (
    <span style={{ background: c.bg, color: c.color, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
      {c.label}
    </span>
  );
};

export default RoundBadge;
