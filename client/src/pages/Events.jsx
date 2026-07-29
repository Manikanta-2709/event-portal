import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';

const categories = ['Music', 'Tech', 'Sports', 'Business', 'Arts', 'Food', 'Education', 'Other'];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    date: searchParams.get('date') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'date',
    order: searchParams.get('order') || 'asc',
  });
  const page = Number(searchParams.get('page')) || 1;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const applyFilters = (e) => {
    e.preventDefault();
    const params = { ...filters, page: 1 };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    setSearchParams(params);
  };

  const goToPage = (p) => {
    setSearchParams({ ...filters, page: p });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">All Events</h1>

      <form onSubmit={applyFilters} className="grid md:grid-cols-6 gap-3 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <input
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        >
          <option value="">Category</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, date: '' })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        >
          <option value="">All ticket types</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select
          value={`${filters.sortBy}-${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('-');
            setFilters({ ...filters, sortBy, order });
          }}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        >
          <option value="date-asc">Date: soonest</option>
          <option value="date-desc">Date: latest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="popularity-desc">Most popular</option>
        </select>
        <input
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
        />
        <button className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700">
          Apply Filters
        </button>
      </form>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <p className="text-slate-500 text-center py-16">No events match your filters.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => <EventCard key={ev._id} event={ev} />)}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </div>
  );
};

export default Events;
