import { Link } from 'react-router-dom';

const categoryColors = {
  Music: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  Tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Sports: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Arts: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const EventCard = ({ event }) => {
  const date = new Date(event.date);
  const soldOut = event.availableSeats <= 0;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition"
    >
      <div className="relative h-44 bg-slate-200 dark:bg-slate-800 overflow-hidden">
        {event.banner?.url ? (
          <img
            src={event.banner.url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No banner</div>
        )}
        <div className="absolute top-3 left-3 flex flex-col items-center bg-white dark:bg-slate-900 rounded-lg px-2.5 py-1 shadow">
          <span className="text-xs font-semibold text-primary-600">
            {date.toLocaleString('default', { month: 'short' }).toUpperCase()}
          </span>
          <span className="text-lg font-display font-bold leading-none">{date.getDate()}</span>
        </div>
        {soldOut && (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Sold Out
          </span>
        )}
      </div>
      <div className="p-4">
        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${categoryColors[event.category] || categoryColors.Other}`}>
          {event.category}
        </span>
        <h3 className="font-display font-semibold text-lg leading-tight line-clamp-1">{event.title}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{event.venue}, {event.city}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold">{event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}</span>
          <span className="text-xs text-slate-500">{event.availableSeats} seats left</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
