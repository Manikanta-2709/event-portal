import { useEffect, useState } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';

const StatCard = ({ label, value }) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    api.get('/bookings').then((res) => {
      setBookings(res.data.bookings);
      setUpcomingCount(res.data.bookings.filter((b) => b.event && new Date(b.event.date) > new Date() && b.bookingStatus === 'confirmed').length);
    });
    api.get('/users/favorites').then((res) => setFavorites(res.data.favorites));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Upcoming Events" value={upcomingCount} />
        <StatCard label="Total Bookings" value={bookings.length} />
        <StatCard label="Favorite Events" value={favorites.length} />
      </div>

      <h2 className="text-xl font-bold mb-4">Favorite Events</h2>
      {favorites.length === 0 ? (
        <p className="text-slate-500 mb-10">No favorites saved yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {favorites.map((ev) => <EventCard key={ev._id} event={ev} />)}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
