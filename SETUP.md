# 🚀 AirWise Team Setup Guide

## Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd Airwise
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 3. Setup Environment
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit with your API keys (see below)
nano backend/.env  # or use your preferred editor
```

### 4. Start Development
```bash
# Start both backend and mobile app
npm run dev

# OR start individually:
npm run backend    # Backend only
npm run mobile     # Mobile app only
```

## 🔑 Required API Keys (Free)

### EPA AirNow (Required)
1. Go to: https://docs.airnowapi.org/account/request/
2. Request API key (free, instant)
3. Add to `.env`: `EPA_AIRNOW_API_KEY=your_key_here`

### OpenWeatherMap (Recommended)
1. Go to: https://openweathermap.org/api
2. Sign up for free account (1000 calls/day)
3. Add to `.env`: `OPENWEATHERMAP_API_KEY=your_key_here`

### MongoDB (Required)
```bash
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/airwise

# Option 2: MongoDB Atlas (free tier)
# Create cluster at https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airwise
```

## 📱 Mobile Development

### Testing on Device
1. Install Expo Go app on your phone
2. Run `npm run mobile`
3. Scan QR code with Expo Go (Android) or Camera (iOS)

### Testing on Emulator
```bash
# Android (requires Android Studio)
npm run mobile:android

# iOS (requires Xcode, macOS only)
npm run mobile:ios

# Web browser
npm run mobile:web
```

## 🛠 Backend Development

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Test endpoint
curl http://localhost:3000/api/v1/test

# Air quality (after EPA key setup)
curl "http://localhost:3000/api/v1/air-quality/current?lat=29.7604&lon=-95.3698"
```

### Database Setup
```bash
# Local MongoDB (if using local instance)
brew install mongodb-community  # macOS
sudo systemctl start mongod     # Linux

# Or use MongoDB Atlas cloud (recommended)
```

## 👥 Team Roles & Focus Areas

### Frontend Developer
**Focus**: `mobile/src/` directory
- Components: `mobile/src/components/`
- Screens: `mobile/src/screens/`
- UI/UX implementation
- Real-time data display

### Backend Developer
**Focus**: `backend/src/` directory
- API endpoints: `backend/src/routes/`
- Business logic: `backend/src/services/`
- Database models: `backend/src/models/`
- External API integrations

### AI/Data Specialist
**Focus**: Recommendation algorithms
- Health risk calculations
- Personalization logic
- Data processing pipelines
- Gemini AI integration

### DevOps/Product Manager
**Focus**: Project coordination
- Deployment setup
- Environment management
- Testing coordination
- Demo preparation

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 🧪 Testing Endpoints

### Health Check
```bash
curl http://localhost:3000/health
# Expected: {"status":"OK","timestamp":"...","uptime":...}
```

### Air Quality Test
```bash
# Houston coordinates
curl "http://localhost:3000/api/v1/air-quality/current?lat=29.7604&lon=-95.3698"
```

## 🚨 Troubleshooting

### Common Issues

**Mobile app won't start:**
```bash
cd mobile
rm -rf node_modules
npm install
npm start
```

**Backend connection errors:**
- Check MongoDB is running
- Verify API keys in `.env`
- Check port 3000 isn't in use

**API key issues:**
- Ensure no spaces in `.env` file
- Restart backend after adding keys
- Check API key validity on provider website

**Expo/React Native issues:**
```bash
# Clear Expo cache
cd mobile
npx expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache
```

## 📊 Development URLs

- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **Mobile App**: Expo dev server (scan QR)
- **Mobile Web**: http://localhost:8081 (if using web)

## ⚡ Quick Commands Reference

```bash
# Root level commands
npm run dev          # Start both backend + mobile
npm run install:all  # Install all dependencies
npm run build:all    # Build backend for production

# Mobile commands
npm run mobile       # Start Expo dev server
npm run mobile:web   # Run in web browser

# Backend commands
npm run backend      # Start development server
npm run backend:build # Build TypeScript
```

## 🎯 Ready to Code!

Your development environment is now ready. Choose your role focus area and start building!

**Next Steps:**
1. Pick a feature from the README milestones
2. Create a feature branch
3. Start coding
4. Test your changes
5. Commit and push

Happy hacking! 🚀