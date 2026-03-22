import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">account_tree</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Oak<span className="text-primary">Cred</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" active={isActive('/')}>Home</NavLink>
          <NavLink to="/product" active={isActive('/product')}>Product</NavLink>
          <NavLink to="/about" active={isActive('/about')}>About Us</NavLink>
          <NavLink to="/dashboard" active={isActive('/dashboard')} target="_blank">Portal</NavLink>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login"
            className="hidden sm:block text-sm font-medium text-text-muted hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/dashboard"
            target="_blank"
            className="text-sm font-medium bg-gradient-primary text-white px-5 py-2.5 rounded-lg hover-glow transition-all"
          >
            Launch Portal
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children, target }) {
  return (
    <Link
      to={to}
      target={target}
      className={`text-sm font-medium transition-colors ${
        active ? 'text-white' : 'text-text-muted hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
