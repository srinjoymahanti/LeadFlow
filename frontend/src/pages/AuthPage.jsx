import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, BarChart3, CheckCircle2, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const signup = mode === 'signup';
  const { user, login, signup: register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async event => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (signup ? register(form) : login({ email: form.email, password: form.password }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="auth-orbit auth-orbit--one" />
        <div className="auth-orbit auth-orbit--two" />
        <div className="auth-orbit auth-orbit--three" />
        <Link to="/login" className="auth-brand">
          <span className="brand-mark"><BarChart3 size={21} strokeWidth={2.5} /></span>
          <span>leadflow<span className="brand-period">.</span></span>
        </Link>
        <div className="story-content">
          <p className="story-eyebrow"><span /> A CALMER WAY TO KEEP BUSINESS MOVING</p>
          <h1>Good leads deserve <em>good follow-through.</em></h1>
          <p className="story-description">
            Your whole pipeline, minus the busywork. Pick up the right conversation right where you left it.
          </p>
          <div className="pipeline-preview" aria-label="Illustration of the Leadflow dashboard">
            <div className="preview-topbar">
              <span className="preview-dots"><i /><i /><i /></span>
              <span className="preview-title">YOUR PIPELINE <b>/</b> OVERVIEW</span>
              <span className="preview-live"><i /> LIVE</span>
            </div>
            <div className="preview-content">
              <div className="preview-summary">
                <div>
                  <span className="preview-label">OPPORTUNITY FLOW</span>
                  <strong>Keep the momentum.</strong>
                </div>
                <span className="preview-trend"><Activity size={14} /> Growing</span>
              </div>
              <div className="preview-chart" aria-hidden="true">
                {[28, 42, 34, 57, 48, 73, 62, 88, 68, 96, 78, 100].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="preview-stages">
                <div><i className="stage-dot stage-dot--new" /><span>New</span><strong>01</strong></div>
                <div><i className="stage-dot stage-dot--contacted" /><span>In conversation</span><strong>02</strong></div>
                <div><i className="stage-dot stage-dot--qualified" /><span>Qualified</span><strong>03</strong></div>
              </div>
            </div>
          </div>
          <div className="story-note"><span>✳</span> BUILT FOR THE FOLLOW-THROUGH</div>
        </div>
        <p className="story-footer">© 2026 Leadflow. A little more clarity for every conversation.</p>
      </section>

      <section className="auth-form-side">
        <Link to="/login" className="auth-brand auth-brand--mobile">
          <span className="brand-mark"><BarChart3 size={19} strokeWidth={2.5} /></span>
          <span>leadflow<span className="brand-period">.</span></span>
        </Link>
        <div className="auth-card">
          <div className="auth-card-topline">
            <span className="auth-card-icon"><LockKeyhole size={17} /></span>
            <span><strong>PRIVATE WORKSPACE</strong><small>Secure access to your leads</small></span>
          </div>
          <div className="auth-heading">
            <p className="auth-eyebrow">{signup ? 'START YOUR WORKSPACE' : 'PICK UP WHERE YOU LEFT OFF'}</p>
            <h2>{signup ? 'Let’s get started.' : 'Welcome back.'}</h2>
            <p>{signup ? 'Create your account and bring your pipeline into focus.' : 'Your next good conversation is just around the corner.'}</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            {signup && (
              <label className="block">
                <span className="label">Full name</span>
                <input
                  className="field"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={event => setForm({ ...form, name: event.target.value })}
                />
              </label>
            )}
            <label className="block">
              <span className="label">Email address</span>
              <input
                className="field"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={event => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input
                className="field"
                type="password"
                minLength="8"
                placeholder="At least 8 characters"
                autoComplete={signup ? 'new-password' : 'current-password'}
                required
                value={form.password}
                onChange={event => setForm({ ...form, password: event.target.value })}
              />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button disabled={busy} className="btn-primary auth-submit">
              <span>{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</span>
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            {signup ? 'Already have an account?' : 'New to Leadflow?'}
            {' '}<Link to={signup ? '/login' : '/signup'}>{signup ? 'Sign in' : 'Create an account'}</Link>
          </p>
          <div className="auth-private"><CheckCircle2 size={15} /> Private to you. Ready when you are.</div>
        </div>
        <p className="auth-bottom-note">A LITTLE MORE CLARITY FOR EVERY CONVERSATION.</p>
      </section>
    </main>
  );
}
