import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUserBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking request?')) return;
    try {
      await api.cancelBooking(id);
      fetchBookings();
    } catch (err) {
      alert(`Failed to cancel: ${err.message}`);
    }
  };

  if (loading) return <div className="card">Loading bookings...</div>;

  return (
    <div className="card animate-fade">
      <div className="card-header">
        <div>
          <h2>My Bookings</h2>
          <p>Track approval progress, review outcomes, and cancel active requests when needed.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchBookings}>Refresh</button>
      </div>

      {error && <div className="badge badge-rejected" style={{ justifySelf: 'start', marginBottom: '1rem' }}>{error}</div>}

      {bookings.length === 0 ? (
        <p style={{ padding: '2rem 0', textAlign: 'center' }}>You have not created any bookings yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.resourceName}</td>
                  <td>{booking.date}</td>
                  <td>{booking.startTime} - {booking.endTime}</td>
                  <td>{booking.purpose}</td>
                  <td>
                    <span className={`badge badge-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                    {booking.reviewReason && (
                      <div className="text-xs mt-2 p-2 rounded" style={{ background: 'var(--danger-surface)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>
                        <strong>Reason:</strong> {booking.reviewReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {['PENDING', 'APPROVED'].includes(booking.status) && (
                      <button className="btn btn-danger-outline" onClick={() => handleCancel(booking.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
