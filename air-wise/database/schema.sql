-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  health_conditions JSONB DEFAULT '[]'::jsonb,
  age_group TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved places table  
CREATE TABLE saved_places (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  place_type TEXT DEFAULT 'custom',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Air quality cache table
CREATE TABLE air_quality_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_hash TEXT UNIQUE NOT NULL,
  aqi_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for saved_places
CREATE POLICY "Users can view own places" ON saved_places
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own places" ON saved_places
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own places" ON saved_places
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own places" ON saved_places
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for air_quality_cache (readable by all authenticated users)
CREATE POLICY "Authenticated users can read cache" ON air_quality_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cache" ON air_quality_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cache" ON air_quality_cache
  FOR UPDATE USING (auth.role() = 'authenticated');
