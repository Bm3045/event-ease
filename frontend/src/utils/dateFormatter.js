import { format, parseISO } from 'date-fns';

export const formatDate = (dateString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd-MMM-yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString, timeString) => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return `${format(date, 'dd-MMM-yyyy')} at ${timeString}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

export const isEventPast = (eventDate) => {
  const today = new Date();
  const event = new Date(eventDate);
  return event < today;
};