import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAdminAuth } from './AuthContext.jsx';
import { Banner } from './adminUi.jsx';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center">
          <Logo className="h-14 w-14" dark />
          <h1 className="mt-5 font-display text-2xl font-bold text-white">QIMA Admin Panel</h1>
          <p className="mt-1.5 text-sm text-navy-400">Sign in to manage the website content</p>
        </div>

        <form onSubmit={onSubmit} className="mt-9 rounded-2xl bg-white p-7 shadow-lift sm:p-8">
          <Banner type="error" message={error} onDismiss={() => setError('')} />

          <label className="block">
            <span className="label">Email address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qima.qa"
                className="input !pl-10"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="label">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input !pl-10"
              />
            </div>
          </label>

          <button type="submit" disabled={busy} className="btn-primary mt-7 w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to the website
          </Link>
        </div>
      </div>
    </div>
  );
}
