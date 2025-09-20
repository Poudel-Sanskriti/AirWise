# AirWise - Air Quality & Lung Health App

A mobile-first application that integrates real-time air quality data with personalized health recommendations for the IDSO Healthcare Challenge.

## 🏆 Challenge Focus
- **Track**: MD Anderson IDSO Air Quality & Lung Health Challenge
- **Goal**: Bridge environmental exposure data with personal health guidance
- **Timeline**: 24-hour hackathon implementation

## 🚀 Quick Start for Team Development

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Expo CLI: `npm install -g @expo/cli`
- Git for version control

### 1. Clone & Setup
```bash
git clone <repository-url>
cd Airwise

# Install mobile app dependencies
cd mobile
npm install

# Install backend dependencies
cd ../backend
npm install

# Copy environment files
cp .env.example .env
```

### 2. Configure Environment
Edit `backend/.env` with your API keys:
- EPA AirNow API key (free)
- OpenWeatherMap API key (free tier)
- MongoDB connection string
- Auth0 credentials (optional for MVP)

### 3. Start Development

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Mobile App (Terminal 2):**
```bash
cd mobile
npm start
# Expo dev server starts, scan QR with Expo Go app
```

### 4. Team Workflow
- **Frontend Dev**: Focus on `mobile/src/` directory
- **Backend Dev**: Focus on `backend/src/` directory
- **AI/Data Dev**: Implement recommendation algorithms
- **DevOps/PM**: Handle deployment and coordination

## 📱 Core Features (IDSO Requirements)

### ✅ Here-and-Now Risk Card
- Real-time PM2.5, PM10, O3, NO2 monitoring
- GPS-based location services
- Clear status: Good/Caution/Avoid
- One-sentence risk rationale

### ✅ Personalized Health Profile
- Health conditions (asthma, cardiopulmonary, pregnancy)
- Age-based adjustments (child, adult, senior)
- Lifestyle factors and domestic risks
- Personalized threshold calculations

### ✅ Saved Places Management
- Home, Work, School, Gym locations
- One-tap risk assessments
- 6-12 hour forecasting
- Geofencing capabilities

### 🎯 Bonus: Run Coach
- Optimal activity timing
- Cleaner direction recommendations
- Duration suggestions based on conditions
- Smoke signal integration

## 🛠 Tech Stack

### Mobile App
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind for RN)
- **State**: React Context + hooks

### Backend API
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Auth**: Auth0 (optional for MVP)
- **Deployment**: Google Cloud Run

### External APIs
- **Air Quality**: EPA AirNow (free), OpenWeatherMap (freemium)
- **Weather**: OpenWeatherMap, NOAA (free)
- **Wildfire**: NASA FIRMS (free)
- **Allergens**: Pollen.com (freemium)
- **AI**: Google Gemini API

## 📂 Project Structure

```
Airwise/
├── mobile/                 # React Native Expo app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API calls & data fetching
│   │   ├── contexts/       # React contexts for state
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Helper functions
│   ├── assets/             # Images, icons, fonts
│   └── app.json           # Expo configuration
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Custom middleware
│   │   └── types/         # TypeScript definitions
│   └── .env.example      # Environment template
└── docs/                 # Documentation & design assets
```

## 🔧 Development Commands

### Mobile App
```bash
cd mobile
npm start          # Start Expo dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
```

### Backend API
```bash
cd backend
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm test           # Run test suite
```

## 🌍 API Endpoints

### Health Check
- `GET /health` - Server status and uptime

### Air Quality
- `GET /api/v1/air-quality/current?lat={lat}&lon={lon}` - Current air quality
- `GET /api/v1/air-quality/forecast?lat={lat}&lon={lon}` - 12-hour forecast

### User Profile
- `POST /api/v1/users/profile` - Create/update health profile
- `GET /api/v1/users/profile` - Get user profile

### Locations
- `POST /api/v1/locations` - Save new location
- `GET /api/v1/locations` - Get user's saved locations

## 🎯 Hackathon Milestones

### Hour 0-6: Foundation
- [x] Project setup and team coordination
- [x] Basic mobile app with navigation
- [x] Backend API with health endpoint
- [x] EPA AirNow integration

### Hour 6-12: Core Features
- [ ] Risk card implementation
- [ ] Health profile creation
- [ ] Real-time air quality display
- [ ] Location services integration

### Hour 12-18: Advanced Features
- [ ] Saved places functionality
- [ ] Personalized recommendations
- [ ] Push notifications
- [ ] Data caching and optimization

### Hour 18-24: Polish & Deploy
- [ ] Run Coach bonus feature
- [ ] UI/UX improvements
- [ ] Testing and bug fixes
- [ ] Demo preparation and deployment

## 🏃‍♂️ Run Coach Algorithm (Bonus)

The Run Coach analyzes:
- Current air quality levels
- Wind direction and speed
- Traffic patterns
- Time of day
- User's fitness profile
- Smoke/wildfire proximity

Recommendations include:
- Optimal start time window
- Suggested route direction
- Activity duration limits
- Alternative indoor options

## 🔒 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

- **Required for basic functionality**: EPA_AIRNOW_API_KEY, MONGODB_URI
- **Optional for enhanced features**: OPENWEATHERMAP_API_KEY, AUTH0 credentials
- **Bonus features**: PURPLEAIR_API_KEY, GOOGLE_MAPS_API_KEY

## 📊 Data Flow

1. **User Location** → GPS/Manual Entry
2. **External APIs** → Air Quality + Weather Data
3. **AI Processing** → Personalized Risk Assessment
4. **Mobile App** → Real-time Updates + Notifications
5. **User Action** → Informed Health Decisions

## 🏆 Competition Strategy

**Primary Target**: MD Anderson IDSO Healthcare Challenge
**Secondary Targets**: Best Use of MongoDB Atlas, Auth0, Gemini API

**Success Metrics**:
- Complete IDSO feature implementation
- Real data integration and accuracy
- Smooth user experience demonstration
- Clear health impact messaging

---

**Happy Hacking! 🚀**

For questions or issues, check the team Discord or create GitHub issues.