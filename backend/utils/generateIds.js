const moment = require('moment');

const generateEventId = () => {
  const monthYear = moment().format('MMMYYYY').toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `EVT-${monthYear}-${randomChars}`;
};

const generateBookingId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BKG-${timestamp}-${randomChars}`;
};

module.exports = {
  generateEventId,
  generateBookingId
};