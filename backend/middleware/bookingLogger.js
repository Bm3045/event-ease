const bookingLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.success && req.method === 'POST' && req.originalUrl.includes('/bookings')) {
        console.log('🎫 New Booking Created:', {
          timestamp: new Date().toISOString(),
          userId: req.user?.id,
          bookingId: parsedData.data?.bookingId,
          eventId: req.body?.eventId,
          seats: req.body?.seats
        });
      }
    } catch (error) {
      // If response is not JSON, ignore
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = bookingLogger;