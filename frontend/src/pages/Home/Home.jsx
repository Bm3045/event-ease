import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar } from 'lucide-react';
import { eventsAPI } from '../../services/api';
import EventCard from '../../components/Common/EventCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { EVENT_CATEGORIES, LOCATION_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    locationType: 'all',
    date: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.locationType !== 'all') params.locationType = filters.locationType;
      if (filters.date) params.date = filters.date;
      
      const response = await eventsAPI.getAll(params);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Events
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Book tickets for concerts, workshops, webinars and more. Your next great experience awaits!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 pr-4 py-3 text-lg"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {EVENT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <select
            value={filters.locationType}
            onChange={(e) => handleFilterChange('locationType', e.target.value)}
            className="input-field"
          >
            <option value="all">All Locations</option>
            {LOCATION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="input-field"
            />
          </div>

          <button
            onClick={() => setFilters({ category: 'all', locationType: 'all', date: '' })}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Upcoming Events ({filteredEvents.length})
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;