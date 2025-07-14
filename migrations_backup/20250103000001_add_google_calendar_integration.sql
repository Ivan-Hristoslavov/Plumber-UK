-- Add Google Calendar event ID to bookings table
ALTER TABLE bookings 
ADD COLUMN google_calendar_event_id TEXT DEFAULT NULL;

-- Add index for faster queries
CREATE INDEX idx_bookings_google_calendar_event_id ON bookings(google_calendar_event_id);

-- Add comment for documentation
COMMENT ON COLUMN bookings.google_calendar_event_id IS 'Google Calendar event ID for synced bookings'; 