-- Add location fields to monasteries and profiles tables
-- Migration: add_location_fields

-- Add location columns to monasteries table
ALTER TABLE monasteries 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add location columns to profiles table  
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create indexes for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_monasteries_location ON monasteries(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_monasteries_active ON monasteries(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);

-- Create a function to calculate distance between two points (optional - for database-level calculations)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, 
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R CONSTANT DECIMAL := 6371; -- Earth's radius in kilometers
    dLat DECIMAL;
    dLon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dLat := RADIANS(lat2 - lat1);
    dLon := RADIANS(lon2 - lon1);
    
    a := SIN(dLat/2) * SIN(dLat/2) + 
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
         SIN(dLon/2) * SIN(dLon/2);
    
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing monasteries to be active by default
UPDATE monasteries SET is_active = true WHERE is_active IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN monasteries.latitude IS 'Monastery latitude coordinate for location-based features';
COMMENT ON COLUMN monasteries.longitude IS 'Monastery longitude coordinate for location-based features';
COMMENT ON COLUMN monasteries.is_active IS 'Whether the monastery is active and should appear in searches';
COMMENT ON COLUMN profiles.latitude IS 'User latitude coordinate for distance calculations';
COMMENT ON COLUMN profiles.longitude IS 'User longitude coordinate for distance calculations';
