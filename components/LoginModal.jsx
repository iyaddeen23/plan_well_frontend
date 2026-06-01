'use client';
import { useState } from 'react';
import { auth } from '@/lib/api';

export default function LoginModal({ onSuccess }) {
  const [mode,     setMode]     = useState('signin'); // 'signin' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const d = await auth.signIn(email, password);
        onSuccess(d.user ?? { email });
      } else {
        await auth.signUp(email, password, fullName);
        // auto sign in after signup
        const d = await auth.signIn(email, password);
        onSuccess(d.user ?? { email });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>

        {/* Logo / header */}
        <div style={styles.header}>
          <div style={styles.logo}>PW</div>
          <div style={styles.appName}>Planwell Accounting</div>
          <div style={styles.subtitle}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </div>
        </div>

        {/* Tab toggle */}
        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(mode === 'signin' ? styles.tabActive : {}) }} onClick={() => { setMode('signin'); setError(''); }}>
            Sign In
          </button>
          <button style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }} onClick={() => { setMode('signup'); setError(''); }}>
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.fg}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="e.g. Kwame Mensah"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div style={styles.fg}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.fg}>
            <label style={styles.label}>Password {mode === 'signup' && <span style={styles.hint}>(min. 8 characters)</span>}</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={{ marginRight: 6 }}>⚠</span>{error}
            </div>
          )}

          <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={styles.switchLine}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button style={styles.link} onClick={toggle}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(10,12,20,0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: '#FAFAF8',
    borderRadius: 16,
    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
    width: '100%', maxWidth: 400,
    padding: '36px 32px 28px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  header: { textAlign: 'center' },
  logo: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 48, height: 48, borderRadius: 12,
    background: 'linear-gradient(135deg,#1D9E75,#0f7a5a)',
    color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 10,
  },
  appName: { fontSize: 20, fontWeight: 700, color: '#1A1A18', letterSpacing: '-0.02em' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  tabs: {
    display: 'flex', background: '#EEEEE9', borderRadius: 8,
    padding: 3, gap: 2,
  },
  tab: {
    flex: 1, padding: '7px 0', border: 'none', borderRadius: 6,
    background: 'transparent', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#666', transition: 'all .15s',
  },
  tabActive: {
    background: '#fff', color: '#1A1A18', fontWeight: 600,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  fg:    { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12.5, fontWeight: 600, color: '#444' },
  hint:  { fontWeight: 400, color: '#999', fontSize: 11, marginLeft: 4 },
  input: {
    padding: '9px 12px', border: '1.5px solid #DDD', borderRadius: 8,
    fontSize: 13.5, outline: 'none', background: '#fff',
    transition: 'border-color .15s',
  },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    color: '#B91C1C', borderRadius: 8,
    padding: '10px 14px', fontSize: 13,
  },
  btn: {
    padding: '11px 0', background: 'linear-gradient(135deg,#1D9E75,#0f7a5a)',
    color: '#fff', border: 'none', borderRadius: 9,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(29,158,117,0.3)',
    transition: 'opacity .15s',
  },
  switchLine: { textAlign: 'center', fontSize: 13, color: '#666' },
  link: {
    background: 'none', border: 'none', color: '#1D9E75',
    fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0,
    textDecoration: 'underline',
  },
};
