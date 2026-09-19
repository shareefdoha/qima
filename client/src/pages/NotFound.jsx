import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-navy-900 pt-24">
      <div className="container-qima text-center">
        <p className="font-display text-7xl font-bold text-accent-500 sm:text-8xl">404</p>
        <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-navy-300">
          The page you're looking for doesn't exist, or has moved.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <button type="button" onClick={() => window.history.back()} className="btn-ghost-light">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </section>
  );
}
