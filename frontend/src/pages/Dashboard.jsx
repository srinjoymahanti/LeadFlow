import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import LeadModal from '../components/LeadModal';

const statuses = ['New', 'Contacted', 'Qualified', 'Lost'];
const sources = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Advertisement', 'Other'];
const fmtDate = value =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 } });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const [leadResponse, dashboardResponse] = await Promise.all([
        api.get('/leads', { params: { page, limit: 8, search, status, source, sortBy, order } }),
        api.get('/leads/dashboard'),
      ]);
      setLeads(leadResponse.data.leads);
      setPagination(leadResponse.data.pagination);
      setStats(dashboardResponse.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load your leads. Check the API connection.');
    } finally {
      setLoading(false);
    }
  }, [search, status, source, sortBy, order]);

  useEffect(() => {
    const timer = setTimeout(() => load(1), 280);
    return () => clearTimeout(timer);
  }, [load]);

  const saveLead = async data => {
    if (editing) await api.put(`/leads/${editing._id}`, data);
    else await api.post('/leads', data);
    setNotice(editing ? 'Lead updated successfully.' : 'Lead added successfully.');
    setEditing(null);
    await load(1);
  };

  const deleteLead = async lead => {
    if (!window.confirm(`Delete ${lead.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/leads/${lead._id}`);
      setNotice('Lead deleted.');
      await load(Math.min(pagination.page, Math.max(1, pagination.pages - (leads.length === 1 ? 1 : 0))));
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete lead.');
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Created'],
      ...leads.map(lead => [
        lead.name, lead.email, lead.phone, lead.company, lead.source, lead.status, fmtDate(lead.createdAt),
      ]),
    ];
    const csv = rows
      .map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leadflow-leads.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: 'Total leads', value: stats.total, icon: Users, tone: 'total', note: 'All captured prospects' },
    { label: 'New leads', value: stats.byStatus.New, icon: TrendingUp, tone: 'new', note: 'Ready for first contact' },
    { label: 'Qualified', value: stats.byStatus.Qualified, icon: Target, tone: 'qualified', note: 'High-intent opportunities' },
    { label: 'Contacted', value: stats.byStatus.Contacted, icon: BarChart3, tone: 'contacted', note: 'Conversations in progress' },
  ];

  return (
    <div className="dashboard-shell">
      <aside className="app-sidebar">
        <a href="/" className="brand-lockup" aria-label="Leadflow home">
          <span className="brand-mark"><BarChart3 size={21} strokeWidth={2.5} /></span>
          <span>leadflow<span className="brand-period">.</span></span>
        </a>
        <p className="sidebar-label">Workspace</p>
        <div className="sidebar-link"><LayoutDashboard size={18} /> Overview</div>
        <div className="sidebar-help">
          <div className="sidebar-help-title"><CircleHelp size={16} /> A little reminder</div>
          <p>Good relationships are built one thoughtful follow-up at a time.</p>
          <span className="help-spark">✳</span>
        </div>
        <div className="sidebar-foot">MADE FOR MOMENTUM <span>↗</span></div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <a href="/" className="brand-lockup mobile-brand" aria-label="Leadflow home">
            <span className="brand-mark"><BarChart3 size={19} strokeWidth={2.5} /></span>
            <span>leadflow<span className="brand-period">.</span></span>
          </a>
          <div className="topbar-context">
            <p>WORKSPACE <span>/</span> OVERVIEW</p>
            <h1>Your pipeline</h1>
          </div>
          <div className="account-area">
            <div className="account-copy">
              <p>{user?.name}</p>
              <span>Workspace owner</span>
            </div>
            <div className="account-avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
            <button onClick={logout} title="Sign out" aria-label="Sign out" className="logout-button">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> YOUR SALES, AT A GLANCE</p>
              <h2>Good to see you, {user?.name?.split(' ')[0]}<span className="wave"> ✳</span></h2>
              <p className="welcome-subtitle">A little more clarity for every conversation.</p>
            </div>
            <button
              onClick={() => { setEditing(null); setModal(true); }}
              className="btn-primary add-lead-button"
            >
              <Plus size={18} /> Add new lead
            </button>
          </section>

          {notice && (
            <div className="notice-banner">
              <span>{notice}</span>
              <button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          )}
          {error && <div className="error-banner">{error}</div>}

          <section className="stats-grid" aria-label="Lead statistics">
            {cards.map(({ label, value, icon: Icon, tone, note }, index) => (
              <article key={label} className={`stat-card stat-card--${tone}`}>
                <div className="stat-topline">
                  <span>{label}</span>
                  <span className="stat-icon"><Icon size={19} /></span>
                </div>
                <div className="stat-value">{value}</div>
                <div className="stat-note">{note}</div>
                <span className="stat-index">0{index + 1}</span>
              </article>
            ))}
          </section>

          <section className="leads-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">THE PEOPLE YOU’RE BUILDING WITH</p>
                <h3>All leads <span className="lead-count">{pagination.total}</span></h3>
                <p className="panel-description">Keep every opportunity moving forward.</p>
              </div>
              <button onClick={exportCSV} className="btn-secondary export-button">
                <Download size={16} /> Export current page
              </button>
            </div>

            <div className="filter-toolbar">
              <div className="search-wrap">
                <Search size={17} />
                <input
                  className="field search-field"
                  placeholder="Search name, email or company…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search leads"
                />
              </div>
              <div className="filter-selects">
                <select className="field filter-field" value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status">
                  <option value="">All statuses</option>
                  {statuses.map(value => <option key={value}>{value}</option>)}
                </select>
                <select className="field filter-field" value={source} onChange={e => setSource(e.target.value)} aria-label="Filter by source">
                  <option value="">All sources</option>
                  {sources.map(value => <option key={value}>{value}</option>)}
                </select>
              </div>
              <div className="sort-wrap">
                <SlidersHorizontal size={16} />
                <select
                  className="field filter-field sort-field"
                  value={`${sortBy}:${order}`}
                  onChange={e => {
                    const [nextSort, nextOrder] = e.target.value.split(':');
                    setSortBy(nextSort);
                    setOrder(nextOrder);
                  }}
                  aria-label="Sort leads"
                >
                  <option value="createdAt:desc">Newest first</option>
                  <option value="createdAt:asc">Oldest first</option>
                  <option value="name:asc">Name A–Z</option>
                  <option value="name:desc">Name Z–A</option>
                  <option value="status:asc">Status</option>
                  <option value="company:asc">Company A–Z</option>
                </select>
              </div>
            </div>

            <div className="table-scroll">
              <table className="leads-table">
                <thead>
                  <tr><th>Lead</th><th>Company</th><th>Source</th><th>Status</th><th>Added</th><th className="actions-heading">Actions</th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="table-message">Loading your leads…</td></tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="table-message empty-state">
                        <span className="empty-icon"><Users size={22} /></span>
                        <strong>No leads found</strong>
                        <span>Try adjusting your filters or add a new lead.</span>
                      </td>
                    </tr>
                  ) : leads.map(lead => (
                    <tr key={lead._id}>
                      <td>
                        <div className="lead-identity">
                          <div className="lead-avatar">
                            {lead.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="lead-copy">
                            <strong>{lead.name}</strong>
                            <span>{lead.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><div className="company-copy"><strong>{lead.company}</strong><span>{lead.phone}</span></div></td>
                      <td className="source-cell">{lead.source}</td>
                      <td><StatusBadge status={lead.status} /></td>
                      <td className="date-cell">{fmtDate(lead.createdAt)}</td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => { setEditing(lead); setModal(true); }}>Edit</button>
                          <button onClick={() => deleteLead(lead)} className="delete-action">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-bar">
              <p>
                Showing <strong>{pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0}–{Math.min(pagination.page * pagination.limit, pagination.total)}</strong>
                {' '}of <strong>{pagination.total}</strong> leads
              </p>
              <div className="pagination-controls">
                <button
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => load(pagination.page - 1)}
                  className="page-btn"
                  aria-label="Previous page"
                ><ChevronLeft size={17} /></button>
                <span>Page <strong>{pagination.page}</strong> of {Math.max(1, pagination.pages)}</span>
                <button
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => load(pagination.page + 1)}
                  className="page-btn"
                  aria-label="Next page"
                ><ChevronRight size={17} /></button>
              </div>
            </div>
          </section>
          <footer className="page-footer">LEADFLOW <span>·</span> A LITTLE MORE CLARITY FOR EVERY CONVERSATION.</footer>
        </div>
      </main>
      <LeadModal
        open={modal}
        lead={editing}
        onClose={() => { setModal(false); setEditing(null); }}
        onSave={saveLead}
      />
    </div>
  );
}
