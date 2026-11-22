const styles = {
  New: 'status-badge--new',
  Contacted: 'status-badge--contacted',
  Qualified: 'status-badge--qualified',
  Lost: 'status-badge--lost',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${styles[status] || styles.New}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
