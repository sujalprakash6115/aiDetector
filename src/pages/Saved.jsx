import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Saved() {
  return (
    <div className="card p-12 text-center animate-fade-in max-w-lg mx-auto mt-12">
      <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
      <h2 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
        Saved Reports
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        Bookmark important analyses from the History page. This feature stores favorites locally and
        will expand in future updates.
      </p>
      <Link to="/history" className="btn-primary">
        Go to History
      </Link>
    </div>
  );
}
