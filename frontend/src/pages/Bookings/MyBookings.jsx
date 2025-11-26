import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, XCircle, CheckCircle } from 'lucide-react';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const canCancelBooking = (booking) => {
    const eventDate = new Date(booking.event.date);
    return booking.status === 'confirmed' && new Date() < eventDate;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your event bookings and cancellations</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600">Start exploring events and make your first booking!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.event.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDateTime(booking.event.date, booking.event.startTime)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>
                        {booking.event.locationType === 'Online' 
                          ? 'Online Event' 
                          : booking.event.location
                        }
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{booking.seats} seat(s)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        Total: {booking.totalAmount === 0 ? 'FREE' : `₹${booking.totalAmount}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    Booking ID: {booking.bookingId} • Booked on {formatDate(booking.bookedAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 md:mt-0 md:ml-6">
                  {canCancelBooking(booking) ? (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancel Booking</span>
                    </button>
                  ) : booking.status === 'cancelled' ? (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Cancelled</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;