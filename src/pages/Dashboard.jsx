import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Bot,
  User,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { getStats } from '../utils/storage';
import { getSession } from '../auth';
import clsx from 'clsx';

const PIE_COLORS = ['#ef4444', '#10b981', '#f59e0b'];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {label}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {sub}
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const user = getSession();
      if (!user) {
        setError('Not signed in');
        setLoading(false);
        return;
      }
      setStats(getStats(user.id));
    } catch (err) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 h-72 skeleton" />
          <div className="card p-5 h-72 skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const pieData = [
    { name: 'AI-like', value: stats.aiLike },
    { name: 'Human-like', value: stats.humanLike },
    { name: 'Mixed', value: stats.mixed },
  ].filter((d) => d.value > 0);

  const hasData = stats.total > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Here&apos;s an overview of your detection activity
          </p>
        </div>
        <Link to="/analyze" className="btn-primary">
          <Plus size={18} /> New Analysis
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total Analyzed"
          value={stats.total}
          sub={`${stats.totalWords.toLocaleString()} words processed`}
          color="var(--color-primary-600)"
        />
        <StatCard
          icon={Bot}
          label="AI-Like Content"
          value={stats.aiLike}
          sub={stats.total ? `${Math.round((stats.aiLike / stats.total) * 100)}% of total` : '—'}
          color="var(--danger)"
        />
        <StatCard
          icon={User}
          label="Human-Like Content"
          value={stats.humanLike}
          sub={stats.total ? `${Math.round((stats.humanLike / stats.total) * 100)}% of total` : '—'}
          color="var(--success)"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. AI Score"
          value={`${stats.avgAi}%`}
          sub={`Human avg: ${stats.avgHuman}%`}
          color="var(--color-primary-500)"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly activity */}
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Weekly Activity
            </h3>
            <Activity size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.weeklyActivity}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary-500)"
                  fill="url(#colorCount)"
                  strokeWidth={2}
                  name="Analyses"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No analyses yet this week" />
          )}
        </div>

        {/* Distribution pie */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              AI vs Human
            </h3>
            <BarChart3 size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          {hasData && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No classification data" />
          )}
        </div>
      </div>

      {/* Monthly + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Monthly Statistics
          </h3>
          {hasData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => {
                    const [y, m] = v.split('-');
                    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(m)-1]}`;
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ai" name="AI-like" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="human" name="Human-like" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No monthly data yet" />
          )}
        </div>

        {/* Recent analyses */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Analyses
            </h3>
            <Link
              to="/history"
              className="text-xs font-medium flex items-center gap-1 hover:underline"
              style={{ color: 'var(--color-primary-600)' }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recent?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent.map((item) => (
                <Link
                  key={item._id}
                  to={`/history`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-muted)] transition"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor:
                        item.aiScore >= 65
                          ? 'color-mix(in srgb, var(--danger) 15%, transparent)'
                          : item.humanScore >= 65
                          ? 'color-mix(in srgb, var(--success) 15%, transparent)'
                          : 'color-mix(in srgb, var(--warning) 15%, transparent)',
                      color:
                        item.aiScore >= 65
                          ? 'var(--danger)'
                          : item.humanScore >= 65
                          ? 'var(--success)'
                          : 'var(--warning)',
                    }}
                  >
                    {item.aiScore}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.fileName}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString()} · {item.wordCount} words
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No analyses yet
              </p>
              <Link to="/analyze" className="btn-primary mt-3 text-xs py-2">
                Start analyzing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-[240px] flex flex-col items-center justify-center">
      <Activity size={32} className="mb-2 opacity-20" />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
    </div>
  );
}
