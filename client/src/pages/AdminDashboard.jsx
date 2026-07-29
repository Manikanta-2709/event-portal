import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const StatCard = ({ label, value }) => (
  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const tabs = ['Overview', 'Users', 'Organizers', 'Events'];

const AdminDashboard = () => {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);

  const fetchOverview = () => {
    api.get('/admin/stats').then((res) => {
      setStats(res.data.stats);
      setRecentUsers(res.data.recentUsers);
    });
  };
  const fetchUsers = () => api.get('/admin/users?role=user').then((res) => setUsers(res.data.users));
  const fetchOrganizers = () => api.get('/admin/users?role=organizer').then((res) => setOrganizers(res.data.users));
  const fetchEvents = () => api.get('/admin/events').then((res) => setEvents(res.data.events));

  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchOrganizers();
    fetchEvents();
  }, []);

  const toggleBlock = async (id) => {
    try {
      await api.put(`/admin/users/${id}/block`);
      toast.success('User status updated');
      fetchUsers();
      fetchOrganizers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const approveOrganizer = async (id) => {
    try {
      await api.put(`/admin/organizers/${id}/approve`);
      toast.success('Organizer approved');
      fetchOrganizers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const removeEvent = async (id) => {
    if (!confirm('Remove this event?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success('Event removed');
      fetchEvents();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && stats && (
        <>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Total Organizers" value={stats.totalOrganizers} />
            <StatCard label="Total Events" value={stats.totalEvents} />
            <StatCard label="Total Bookings" value={stats.totalBookings} />
            <StatCard label="Revenue" value={`₹${stats.totalRevenue}`} />
          </div>
          <h2 className="text-xl font-bold mb-4">Recent Registrations</h2>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex justify-between border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm">
                <span>{u.name} ({u.email})</span>
                <span className="capitalize text-slate-500">{u.role}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-slate-500">{u.email}</p>
              </div>
              <button
                onClick={() => toggleBlock(u._id)}
                className={`text-sm px-3 py-1.5 rounded-lg ${u.isBlocked ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
              >
                {u.isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Organizers' && (
        <div className="space-y-2">
          {organizers.map((o) => (
            <div key={o._id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium">{o.name}</p>
                <p className="text-sm text-slate-500">{o.email}</p>
              </div>
              <div className="flex gap-2">
                {!o.isApproved && (
                  <button onClick={() => approveOrganizer(o._id)} className="text-sm px-3 py-1.5 rounded-lg bg-primary-600 text-white">
                    Approve
                  </button>
                )}
                <button
                  onClick={() => toggleBlock(o._id)}
                  className={`text-sm px-3 py-1.5 rounded-lg ${o.isBlocked ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                >
                  {o.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Events' && (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev._id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium">{ev.title}</p>
                <p className="text-sm text-slate-500">by {ev.organizer?.name} · {ev.city}</p>
              </div>
              <button onClick={() => removeEvent(ev._id)} className="text-sm px-3 py-1.5 rounded-lg bg-rose-600 text-white">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
