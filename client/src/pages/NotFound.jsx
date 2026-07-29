import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="max-w-md mx-auto px-6 py-32 text-center">
    <p className="text-6xl font-display font-bold text-primary-600 mb-4">404</p>
    <h1 className="text-2xl font-bold mb-2">Page not found</h1>
    <p className="text-slate-500 mb-8">The page you're looking for doesn't exist or was moved.</p>
    <Link to="/" className="px-6 py-2.5 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700">
      Back home
    </Link>
  </div>
);

export default NotFound;
