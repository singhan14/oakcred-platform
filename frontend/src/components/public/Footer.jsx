import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-bg border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">account_tree</span>
              </div>
              <span className="font-display font-bold text-lg text-white">OakCred</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              AI-powered credit assessment platform for modern lenders. Make smarter decisions, faster.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/product" className="text-text-muted hover:text-white text-sm transition-colors">Platform Capabilities</Link></li>
              <li><Link to="/product" className="text-text-muted hover:text-white text-sm transition-colors">Security & Trust</Link></li>
              <li><Link to="/dashboard" className="text-text-muted hover:text-white text-sm transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-text-muted hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="#" className="text-text-muted hover:text-white text-sm transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="#" className="text-text-muted hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="text-text-muted hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><a href="mailto:contact@oakcred.com" className="text-text-muted hover:text-white text-sm transition-colors">contact@oakcred.com</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
          <p className="text-text-subtle text-sm">
            © {new Date().getFullYear()} OakCred. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Social Icons (using Material Symbols as placeholders for X/LinkedIn) */}
            <a href="#" className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">link</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">forum</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
