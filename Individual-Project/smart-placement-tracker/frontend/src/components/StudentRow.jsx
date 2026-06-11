import RoundBadge from './RoundBadge';

const ROUNDS = ['applied', 'round1', 'round2', 'selected', 'rejected'];

const StudentRow = ({ student, onUpdateRound, showRound = false, currentRound, applicationId }) => {
  const user = student.userId || {};
  return (
    <tr>
      <td className="table-cell">
        <div style={{ fontWeight: 700 }}>{user.name || 'N/A'}</div>
        <div style={{ fontSize: 11, color: 'var(--muted-light)' }}>{user.email}</div>
      </td>
      <td className="table-cell">{student.rollNumber}</td>
      <td className="table-cell">{student.branch}</td>
      <td className="table-cell" style={{ fontWeight: 600, color: student.cgpa >= 8 ? '#15803d' : student.cgpa >= 6 ? '#b45309' : '#dc2626' }}>
        {student.cgpa}
      </td>
      <td className="table-cell">
        <span className={student.placedStatus ? 'chip' : 'chip chip-muted'}>
          {student.placedStatus ? 'Placed' : 'Not Placed'}
        </span>
      </td>
      {showRound && (
        <>
          <td className="table-cell"><RoundBadge round={currentRound} /></td>
          <td className="table-cell">
            <select id={`round-select-${applicationId}`}
              defaultValue={currentRound}
              onChange={e => onUpdateRound(applicationId, e.target.value)}
              className="input"
              style={{ fontSize: 12, minHeight: 30, padding: '4px 6px' }}>
              {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </td>
        </>
      )}
    </tr>
  );
};

export default StudentRow;
