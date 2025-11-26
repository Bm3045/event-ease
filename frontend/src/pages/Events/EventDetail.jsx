import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock, ArrowLeft, Ticket } from 'lucide-react';
import { eventsAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/dateFormatter';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      setEvent(response.data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBookEvent = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book events');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    try {
      setBookingLoading(true);
      await bookingsAPI.create({
        eventId: id,
        seats: seats
      });
      
      toast.success('Booking confirmed!');
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Events
        </button>
      </div>
    );
  }

  const canBook = event.availableSeats > 0 && event.status === 'Upcoming';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Events</span>
      </button>

      <div className="card overflow-hidden">
        <div className="p-8">
          {/* Event Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === 'Upcoming' ? 'bg-green-100 text-green-800' :
                  event.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {event.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {event.price === 0 ? 'FREE' : `₹${event.price}`}
              </div>
              <div className="text-sm text-gray-600">per person</div>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Event Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-gray-500" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                  <span>
                    {event.locationType === 'Online' ? 'Online Event' : event.location}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-gray-500" />
                  <span>
                    {event.availableSeats} of {event.capacity} seats available
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Your Spot</h3>
              
              {canBook ? (
                <div className="space-y-4">
                  {/* Seat Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Seats (Max 2)
                    </label>
                    <select
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={1}>1 Seat</option>
                      <option value={2}>2 Seats</option>
                    </select>
                  </div>

                  {/* Price Calculation */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Price per seat</span>
                      <span>{event.price === 0 ? 'FREE' : `₹${event.price}`}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total Amount</span>
                      <span>{event.price === 0 ? 'FREE' : `₹${event.price * seats}`}</span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={handleBookEvent}
                    disabled={bookingLoading}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {bookingLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Ticket className="h-5 w-5" />
                        <span>Book Now</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {event.status !== 'Upcoming' 
                      ? 'Booking is not available for this event'
                      : 'This event is fully booked'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Info */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organizer</h3>
            <p className="text-gray-700">
              Organized by {event.createdBy?.name || 'EventEase Team'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;