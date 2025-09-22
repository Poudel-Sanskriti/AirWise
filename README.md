# AirWise - Air Quality & Lung Health App

A mobile-first application that integrates real-time air quality data with personalized health recommendations for the IDSO Healthcare Challenge.

## 🏆 Challenge Focus
- **Track**: MD Anderson IDSO Air Quality & Lung Health Challenge
- **Goal**: Bridge environmental exposure data with personal health guidance
- **Timeline**: 24-hour hackathon implementation

## 🚀 Quick Start (Ready to Demo!)

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- EPA AirNow API key (free from airnowapi.org)
- Google Gemini API key (optional for AI features)

### 1. Clone & Setup
```bash
git clone https://github.com/Poudel-Sanskriti/AirWise.git
cd AirWise

# Install all dependencies
npm run install:all
```

### 2. Configure Environment
Create `backend/.env` with your API keys:
```bash
EPA_AIRNOW_API_KEY=your_api_key_here
GEMINI_API_KEY=your_gemini_key_here
PORT=3001
```

### 3. Start Development

**Start both backend and mobile:**
```bash
npm run dev
# Backend runs on http://localhost:3001
# Mobile app starts with Expo dev server
```

**Or start individually:**
```bash
# Backend only
npm run backend

# Mobile app only
npm run mobile
```

### 4. Demo Ready!
- ✅ **Live Air Quality Data** from EPA AirNow API
- ✅ **GPS Location Services** with fallback
- ✅ **Real-time Weather Integration**
- ✅ **Saved Places Management**
- ✅ **AI-Powered Run Coach** with Google Gemini
- ✅ **Personalized Health Profiles**

## 📱 Implemented Features

### ✅ **Here-and-Now Risk Card** (FULLY IMPLEMENTED)
- **Real-time Air Quality**: PM2.5, PM10, O₃ from EPA AirNow API
- **GPS Location**: Automatic location detection with fallback to Houston
- **Status Display**: Good/Moderate/Caution/Unhealthy with color-coded cards
- **Personalized Recommendations**: AI-generated health guidance
- **Live Weather**: Temperature, humidity, wind, visibility integration

### ✅ **Saved Places Management** (FULLY IMPLEMENTED)
- **Save Locations**: Home, Work, School, Gym with custom icons
- **One-tap Access**: Quick air quality checks for saved places
- **Interactive Map**: Visual place selection and management
- **Real-time Updates**: Current air quality status for each location
- **Address Resolution**: Automatic address lookup and formatting

### ✅ **Personalized Health Profiles** (FULLY IMPLEMENTED)
- **Health Onboarding**: Asthma, heart conditions, pregnancy considerations
- **Age Groups**: Child, adult, senior with adjusted thresholds
- **Fitness Levels**: Activity recommendations based on fitness
- **Sensitivity Settings**: Custom alerts for sensitive individuals
- **Profile Persistence**: User data stored and maintained across sessions

### ✅ **AI-Powered Run Coach** (FULLY IMPLEMENTED)
- **Google Gemini Integration**: Advanced AI recommendations
- **Personalized Guidance**: Based on health profile and current conditions
- **Safety Assessments**: Safe/Caution/Avoid activity levels
- **Time Recommendations**: Best windows for outdoor activities
- **Alternative Suggestions**: Indoor alternatives when air quality is poor

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

### **APIs Successfully Integrated**
- **EPA AirNow API**: Real-time air quality data (PM2.5, PM10, O₃)
- **OpenWeatherMap API**: Weather conditions and forecasts
- **Google Gemini API**: AI-powered health recommendations
- **Expo Location API**: GPS and geocoding services
- **React Native Maps**: Interactive location selection

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

## ✅ **COMPLETED IMPLEMENTATION**

### **Core Hackathon Goals - ALL ACHIEVED!**
- ✅ **EPA AirNow API Integration** - Live air quality data
- ✅ **Risk Card Implementation** - Color-coded status display
- ✅ **Health Profile System** - Onboarding and personalization
- ✅ **Location Services** - GPS with fallback handling
- ✅ **Saved Places** - Full CRUD with interactive map
- ✅ **AI Recommendations** - Google Gemini integration
- ✅ **Run Coach Feature** - Personalized activity guidance
- ✅ **Weather Integration** - Complete weather data display
- ✅ **Mobile-First Design** - Polished React Native UI

### **Technical Achievements**
- ✅ **Real-time Data Processing** - EPA + Weather APIs
- ✅ **AI-Powered Personalization** - Health-based recommendations
- ✅ **Robust Error Handling** - Graceful fallbacks and mock data
- ✅ **Cross-platform Mobile App** - iOS and Android compatible
- ✅ **API Performance** - Optimized data fetching and caching

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

## 🏆 **HACKATHON SUCCESS!**

### **Competition Targets - ACHIEVED!**

#### **Primary Target: MD Anderson IDSO Healthcare Challenge** ✅
- ✅ **All IDSO Requirements Met**: Risk card, health profiles, saved places
- ✅ **Real EPA Data Integration**: Live air quality monitoring
- ✅ **Personalized Health Guidance**: AI-powered recommendations
- ✅ **Mobile-First Experience**: Polished React Native app
- ✅ **Bonus Run Coach**: Advanced AI activity recommendations

#### **Secondary Challenges - QUALIFIED FOR!**
- ✅ **Commure Challenge**: Healthcare solution improving patient experience
- ✅ **Best Use of MongoDB Atlas**: User profiles and saved places storage
- ✅ **Best Use of Gemini API**: AI-powered health recommendations
- ✅ **Lilie Lab AI Challenge**: AI solving real-world health problems (if Rice students)

### **Demo Highlights**
- 🎯 **Live Air Quality**: Real EPA AirNow data for any location
- 🤖 **AI Recommendations**: Personalized health guidance
- 📍 **Smart Location**: GPS with saved places management
- 🏃‍♂️ **Run Coach**: Activity timing and safety recommendations
- 📱 **Polished UI**: Professional mobile app design

---

**Happy Hacking! 🚀**

For questions or issues, check the team Discord or create GitHub issues.