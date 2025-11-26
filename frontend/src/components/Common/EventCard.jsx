import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { EVENT_STATUS } from '../../utils/constants';

const EventCard = ({ event }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case EVENT_STATUS.UPCOMING:
        return 'bg-green-100 text-green-800';
      case EVENT_STATUS.ONGOING:
        return 'bg-blue-100 text-blue-800';
      case EVENT_STATUS.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Event Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {event.category}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {event.price === 0 ? 'FREE' : `₹${event.price}`}
            </div>
          </div>
        </div>

        {/* Event Title & Description */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {event.locationType === 'Online' ? 'Online Event' : event.location}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {event.availableSeats !== undefined 
                ? `${event.availableSeats} seats available`
                : `${event.capacity} capacity`
              }
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/events/${event._id}`}
          className="w-full btn-primary text-center block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;