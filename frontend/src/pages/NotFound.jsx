import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="font-display text-[8rem] font-bold text-border leading-none">404</span>
        <h1 className="font-display text-2xl font-bold text-text mt-2 mb-2">Page not found</h1>
        <p className="text-text-muted mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard" className="bg-primary text-white px-5 py-2.5 rounded-lg font-heading font-semibold text-sm hover:bg-primary-dark transition-colors">
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="border border-border text-text px-5 py-2.5 rounded-lg font-heading font-semibold text-sm hover:bg-surface transition-colors">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
