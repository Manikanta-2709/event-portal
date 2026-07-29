import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const EventAttendees = () => {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}/attendees`).then((res) => setAttendees(res.data.attendees)).finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Attendees</h1>
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : attendees.length === 0 ? (
        <p className="text-slate-500">No attendees yet.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Tickets</th>
                <th className="px-4 py-3">Total Paid</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a._id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-3">{a.user?.name}</td>
                  <td className="px-4 py-3">{a.user?.email}</td>
                  <td className="px-4 py-3">{a.user?.phone}</td>
                  <td className="px-4 py-3">{a.numberOfTickets}</td>
                  <td className="px-4 py-3">₹{a.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventAttendees;
