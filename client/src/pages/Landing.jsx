import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import SkeletonCard from '../components/SkeletonCard';

const categories = ['Music', 'Tech', 'Sports', 'Business', 'Arts', 'Food', 'Education'];

const Landing = () => {
  const [featured, setFeatured] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/events?sortBy=popularity&order=desc&limit=4'),
      api.get('/events?sortBy=date&order=asc&limit=4'),
    ])
      .then(([featRes, upRes]) => {
        setFeatured(featRes.data.events);
        setUpcoming(upRes.data.events);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full mb-5">
              Find your next favorite event
            </span>
            <h1 className="text-5xl font-display font-bold leading-tight mb-6">
              Discover, book, and host events that matter.
            </h1>
            <p className="text-lg text-slate-500 mb-8">
              From intimate meetups to citywide festivals — Eventra connects organizers and attendees
              in one seamless portal.
            </p>
            <div className="flex gap-4">
              <Link to="/events" className="px-6 py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700">
                Browse Events
              </Link>
              <Link to="/register" className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                Become an Organizer
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="ticket-card bg-primary-600 text-white rounded-3xl p-8 rotate-3 shadow-xl">
              <p className="text-sm opacity-80 uppercase tracking-wide">Admit One</p>
              <h3 className="text-2xl font-display font-bold mt-2">Your Next Great Night Out</h3>
              <div className="border-t border-dashed border-white/40 my-6" />
              <div className="flex justify-between text-sm">
                <span>Seat: Anywhere</span>
                <span>Gate: Eventra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/events?category=${c}`}
              className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-400"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Events</h2>
          <Link to="/events" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((ev) => <EventCard key={ev._id} event={ev} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : upcoming.map((ev) => <EventCard key={ev._id} event={ev} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">What people are saying</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Aditi R.', text: 'Booking tickets took less than a minute. Loved the seat tracking.' },
            { name: 'Vikram S.', text: 'As an organizer, the revenue dashboard is genuinely useful.' },
            { name: 'Meera K.', text: 'Clean interface, fast search, and no spam. Exactly what I needed.' },
          ].map((t) => (
            <div key={t.name} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-300 mb-4">"{t.text}"</p>
              <p className="font-semibold text-sm">{t.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
