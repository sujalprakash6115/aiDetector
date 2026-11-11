import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Search,
  Palette,
  BarChart3,
  Bookmark,
} from 'lucide-react';
import { getSession, logout } from '../auth';
import { useTheme } from '../contexts/ThemeContext';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/analyze', icon: FileSearch, label: 'New Analysis' },
  { to: '/history', icon: History, label: 'Analysis History' },
  { to: '/saved', icon: Bookmark, label: 'Saved Reports' },
  { to: '/statistics', icon: BarChart3, label: 'Statistics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const user = getSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, themes } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = (() => {
    const item = navItems.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
    );
    return item?.label || 'AI Detection Platform';
  })();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))' }}
          >
            AI
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-semibold text-sm truncate" style={{ color: 'var(--text-sidebar)' }}>
                DetectAI
              </h1>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-sidebar-muted)' }}>
                Content Detection
              </p>
            </div>
          )}
          <button
            className="lg:hidden ml-auto p-1 rounded-lg hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            style={{ color: 'var(--text-sidebar)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx('sidebar-link', isActive && 'active', collapsed && 'justify-center px-2')
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/10">
          <div
            className={clsx(
              'flex items-center gap-3 p-2 rounded-xl',
              collapsed && 'justify-center'
            )}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{
                backgroundColor: 'var(--color-primary-600)',
                color: 'white',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-sidebar)' }}>
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-sidebar-muted)' }}>
                  {user?.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={clsx(
              'sidebar-link w-full mt-1',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-white/10 hover:bg-white/5 transition"
          style={{ color: 'var(--text-sidebar-muted)' }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <header
          className="h-16 shrink-0 flex items-center gap-4 px-4 lg:px-6 border-b sticky top-0 z-30"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-muted)]"
            onClick={() => setSidebarOpen(true)}
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate" style={{ color: 'var(--text-primary)' }}>
              {pageTitle}
            </h2>
            <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
              AI Content Detection Platform
            </p>
          </div>

          {/* Theme switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-xl hover:bg-[var(--bg-muted)] transition"
              style={{ color: 'var(--text-secondary)' }}
              title="Change theme"
            >
              <Palette size={20} />
            </button>
            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-elevated border z-50 p-2 animate-fade-in"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <p className="text-xs font-medium px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
                    Choose Theme
                  </p>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={clsx(
                        'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition',
                        theme === t.id && 'ring-2 ring-[var(--color-primary-500)]'
                      )}
                      style={{
                        backgroundColor: theme === t.id ? 'var(--bg-muted)' : 'transparent',
                      }}
                    >
                      <div className="flex gap-0.5">
                        {t.preview.map((c, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {t.name}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {t.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-[var(--bg-muted)] transition"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: 'var(--color-primary-600)' }}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                {user?.name?.split(' ')[0]}
              </span>
            </button>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl shadow-elevated border z-50 py-1 animate-fade-in"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-muted)] transition"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <User size={16} /> Profile & Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-muted)] transition"
                    style={{ color: 'var(--danger)' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
