# 🌬️ AirWise - Developer PRD

## Core Features (MVP)
1. **Risk Card** - Current AQI + personalized status
2. **Health Profile** - User conditions affecting thresholds  
3. **Saved Places** - Quick location checks
4. **Run Coach** - AI activity recommendations

## Tech Stack
- **Frontend**: Expo (React Native)
- **Auth**: Google OAuth → Supabase
- **DB**: Supabase PostgreSQL
- **APIs**: OpenWeatherMap, Google Maps, Gemini, Expo Push

## Database Schema
```sql
user_profiles (user_id, health_conditions: JSONB, age_group, preferences: JSONB)
saved_places (user_id, name, lat, lng, place_type)
air_quality_cache (location_hash, aqi_data: JSONB, cached_at)
```

## API Flows
1. **Auth**: Google OAuth → Supabase user creation
2. **Air Quality**: User location → OpenWeatherMap → personalized thresholds
3. **AI Coach**: Health profile + AQI + location → Gemini → recommendations
4. **Notifications**: AQI changes → Expo Push

## App Structure
```
src/
├── screens/ (Home, Profile, Places, Coach)
├── components/ (RiskCard, PlaceItem, HealthSelector)
├── services/ (airQuality, gemini, notifications)
├── utils/ (thresholds, formatters)
└── types/ (User, AirQuality, Place)
```

## Key Functions
- `getPersonalizedAQI(userProfile, rawAQI)` - Adjust thresholds
- `getAirQualityData(lat, lng)` - Fetch & cache AQI
- `generateRecommendations(profile, aqi, location)` - Gemini integration
- `sendNotification(user, message)` - Push alerts

## MVP User Flow
1. Google login → health profile setup
2. Location permission → current AQI display  
3. Add saved places → quick checks
4. Get AI recommendations → actionable advice

**Build Time: 3-4 days with 4 developers**