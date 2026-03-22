import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GradientText from './ui/GradientText';

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/borrowers', icon: 'people', label: 'All Clients' },
  { to: '/assessment/new', icon: 'add_circle', label: 'New Assessment' },
  { to: '/monitoring', icon: 'monitor_heart', label: 'Monitoring' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 pb-4">
        <NavLink to="/dashboard" className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">account_tree</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Oak<GradientText>Cred</GradientText></h1>
        </NavLink>
        <span className="text-[10px] font-label uppercase tracking-[0.2em] text-text-muted block">
          {user?.firm?.name || 'Workspace'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 mt-6 space-y-2">
        <p className="px-2 text-[10px] font-label font-bold text-text-muted/60 uppercase tracking-widest mb-3">Menu</p>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-500 ${
                isActive
                  ? 'bg-primary/5 text-white shadow-[0_0_20px_rgba(245,158,11,0.05)] font-bold backdrop-blur-md'
                  : 'text-text-muted hover:text-white hover:bg-white/[0.02] hover:shadow-sm'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : ''}`}>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 m-4 rounded-3xl bg-white/[0.01] hover:bg-white/[0.02] transition-colors border border-transparent flex items-center justify-between group">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-primary shrink-0 shadow-inner">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="min-w-0 truncate">
            <p className="text-sm font-medium truncate text-white whitespace-nowrap">{user?.name || 'User'}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">{user?.role === 'CA_ADMIN' ? 'Admin' : user?.role || 'Staff'}</p>
          </div>
        </div>
        <button onClick={handleLogout} title="Logout" className="text-text-muted hover:text-error transition-colors p-1 rounded-md hover:bg-error/10">
          <span className="material-symbols-outlined text-[18px]">logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] min-h-screen bg-bg/40 backdrop-blur-3xl text-white fixed left-0 top-0 z-40 border-r border-white/[0.02]">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="p-1 text-text-muted hover:text-white transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h1 className="font-display text-lg font-bold">Oak<GradientText>Cred</GradientText></h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-surface2 border border-border flex items-center justify-center text-xs font-bold text-primary">
            {user?.name?.[0] || 'U'}
          </div>
        </div>
      </header>

      {/* Mobile spacer */}
      <div className="md:hidden h-[60px]" />

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-surface border-r border-border text-white z-50 flex flex-col animate-slide-in shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-border/30">
               <h1 className="font-display text-xl font-bold">Oak<GradientText>Cred</GradientText></h1>
              <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-white p-1 rounded-md hover:bg-surface2 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
