import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getStats } from '../utils/storage';
import { getSession } from '../auth';
import { Activity, Loader2 } from 'lucide-react';

const PIE_COLORS = ['#ef4444', '#10b981', '#f59e0b'];

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = getSession();
      if (user) setStats(getStats(user.id));
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="card p-12 text-center">
        <Activity size={40} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
          No statistics yet
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Run analyses to build your statistics dashboard
        </p>
      </div>
    );
  }

  const pieData = [
    { name: 'AI-like', value: stats.aiLike },
    { name: 'Human-like', value: stats.humanLike },
    { name: 'Mixed', value: stats.mixed },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'AI-like', value: stats.aiLike },
          { label: 'Human-like', value: stats.humanLike },
          { label: 'Avg AI Score', value: `${stats.avgAi}%` },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Weekly Activity
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="var(--color-primary-500)" fill="var(--color-primary-100)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Classification Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Monthly Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.monthlyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Legend />
            <Bar dataKey="ai" name="AI-like" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="human" name="Human-like" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
