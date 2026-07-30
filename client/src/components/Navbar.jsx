import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';

const dashboardPath = {
  user: '/dashboard/user',
  organizer: '/dashboard/organizer',
  admin: '/dashboard/admin',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">
          Eventra
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/events" className="hover:text-primary-600 dark:hover:text-primary-400">Events</Link>
          {user && (
            <Link to={dashboardPath[user.role]} className="hover:text-primary-600 dark:hover:text-primary-400">
              Dashboard
            </Link>
          )}
          {user?.role === 'organizer' && (
            <Link to="/events/create" className="hover:text-primary-600 dark:hover:text-primary-400">
              Create Event
            </Link>
          )}
          {user?.role === 'user' && (
            <Link to="/bookings" className="hover:text-primary-600 dark:hover:text-primary-400">
              My Bookings
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm font-medium hover:text-primary-600">
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                Login
              </Link>
              <Link to="/register" className="text-sm px-3 py-1.5 rounded-full bg-primary-600 text-white hover:bg-primary-700">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
