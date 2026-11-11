import { getAnalyses, deleteAnalyses } from '../utils/storage';
import { useState } from 'react';
import { User, Lock, Palette, Database, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { getSession, updateProfile, changePassword, logout } from '../auth';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Settings() {
  const user = getSession();
  const navigate = useNavigate();
  const { theme, setTheme, themes } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const [clearing, setClearing] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    setProfileErr('');
    const res = await updateProfile({ name, email });
    setProfileLoading(false);
    if (res.ok) setProfileMsg('Profile updated successfully');
    else setProfileErr(res.error);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (newPw !== confirmPw) {
      setPwErr('Passwords do not match');
      return;
    }
    if (newPw.length < 6) {
      setPwErr('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    const res = await changePassword(currentPw, newPw);
    setPwLoading(false);
    if (res.ok) {
      setPwMsg('Password changed successfully');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } else setPwErr(res.error);
  };

  const clearHistory = async () => {
    if (!confirm('This will permanently delete ALL your analysis history. Continue?')) return;
    setClearing(true);
    try {
      const user = getSession();
      if (user) {
        const list = getAnalyses(user.id);
        if (list.length > 0) {
          deleteAnalyses(list.map((a) => a.id), user.id);
        }
      }
      alert('History cleared');
    } catch {
      alert('Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Appearance */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Appearance
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Choose your preferred theme. Preference is saved automatically.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border text-left transition',
                theme === t.id && 'ring-2 ring-[var(--color-primary-500)]'
              )}
              style={{
                backgroundColor: theme === t.id ? 'var(--bg-muted)' : 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex gap-0.5 shrink-0">
                {t.preview.map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {t.name}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {t.description}
                </p>
              </div>
              {theme === t.id && (
                <CheckCircle2 size={16} className="ml-auto" style={{ color: 'var(--color-primary-600)' }} />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Profile */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Profile
          </h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {profileMsg && (
            <p className="text-sm" style={{ color: 'var(--success)' }}>
              {profileMsg}
            </p>
          )}
          {profileErr && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              {profileErr}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={profileLoading}>
            {profileLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Profile
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Change Password
          </h2>
        </div>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
          </div>
          {pwMsg && (
            <p className="text-sm" style={{ color: 'var(--success)' }}>
              {pwMsg}
            </p>
          )}
          {pwErr && (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              {pwErr}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={pwLoading}>
            {pwLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Update Password
          </button>
        </form>
      </section>

      {/* Data */}
      <section className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            Data & Privacy
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Only short text snippets are stored in the database — never full documents. Analysis history
          is private to your account.
        </p>
        <button className="btn-danger" onClick={clearHistory} disabled={clearing}>
          {clearing ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
          Clear All Analysis History
        </button>
      </section>
    </div>
  );
}
