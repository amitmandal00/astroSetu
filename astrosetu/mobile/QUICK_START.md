# Mobile App - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- React Native development environment set up
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

### Installation

1. **Navigate to mobile directory**
   ```bash
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **For iOS (Mac only)**
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

#### Start Metro Bundler
```bash
npm start
```

#### Run on iOS
```bash
npm run ios
```

#### Run on Android
```bash
npm run android
```

---

## 📱 App Structure

### Main Navigation
- **Home** - Dashboard with features and quick actions
- **Kundli** - Generate birth chart
- **Horoscope** - Daily/weekly/monthly/yearly predictions
- **Astrologers** - Browse and chat with experts
- **Profile** - User profile and settings

### Key Features
- ✅ Kundli generation
- ✅ Horoscope predictions
- ✅ Astrologer consultation
- ✅ Chat with astrologers
- ✅ E-wallet system
- ✅ Reports generation
- ✅ Premium services
- ✅ Kundli matching
- ✅ Panchang
- ✅ Numerology

---

## 🎨 Design System

### Colors
- **Primary**: Saffron/Orange (#F97316)
- **Secondary**: Gold (#F59E0B)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Components
All screens use consistent UI components:
- `Card` - For containers
- `Button` - For actions
- `Input` - For forms
- `Badge` - For status
- `SkeletonLoader` - For loading
- `EmptyState` - For empty states

---

## 🔧 Configuration

### API Configuration
Update API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api-url.com';
```

### Theme Customization
Modify colors in `src/theme/ThemeProvider.tsx`:
```typescript
export const colors = {
  primary: '#F97316', // Change to your brand color
  // ... other colors
};
```

---

## 📝 Development Tips

### Adding a New Screen
1. Create screen file in `src/screens/[feature]/[Feature]Screen.tsx`
2. Add route in `src/navigation/AppNavigator.tsx`
3. Use UI components from `src/components/ui/`

### Styling
- Use theme from `useTheme()` hook
- Follow spacing system (xs, sm, md, lg, xl, xxl)
- Use borderRadius system (sm, md, lg, xl, full)
- Apply typography from theme

### Best Practices
- ✅ Use TypeScript for type safety
- ✅ Use theme colors, spacing, typography
- ✅ Add loading states
- ✅ Add empty states
- ✅ Handle errors gracefully
- ✅ Use KeyboardAvoidingView for forms

---

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

### iOS Build Issues
```bash
cd ios && pod install && cd ..
```

### Android Build Issues
```bash
cd android && ./gradlew clean && cd ..
```

### Clear All Caches
```bash
npm start -- --reset-cache
# Then in another terminal:
npm run android  # or npm run ios
```

---

## 📚 Documentation

- **Complete Status**: See `FINAL_STATUS.md`
- **UI Enhancements**: See `UI_ENHANCEMENTS_SUMMARY.md`
- **Complete Guide**: See `COMPLETE_ENHANCEMENTS.md`

---

## ✅ Ready to Deploy!

The app is production-ready. Follow your deployment process for:
- App Store (iOS)
- Google Play Store (Android)

Good luck! 🚀
