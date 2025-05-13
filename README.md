# Ask AI - React Native Mobile Application

A modern React Native mobile application built with Expo, featuring AI interactions and advanced media capabilities.

## 🚀 Tech Stack

### Core Technologies

- [React Native](https://reactnative.dev/) (v0.74.5) - Mobile application framework
- [Expo](https://expo.dev/) (v51.0.28) - Development platform
- [TypeScript](https://www.typescriptlang.org/) (v5.3.3) - Type safety
- [NativeWind](https://www.nativewind.dev/) (v4.1.23) - Tailwind CSS for React Native
- [Expo Router](https://docs.expo.dev/router/introduction/) (v3.5.23) - File-based routing

### Key Dependencies

- **UI & Styling**

  - [@expo/vector-icons](https://icons.expo.fyi/) (v14.0.3) - Icon library
  - [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) (v3.10.1) - Animations
  - [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) (v2.16.1) - Gesture handling
  - [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native) (v6.7.0) - Animation support

- **State & Storage**

  - [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) (v1.23.1) - Local storage
  - [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) (v4.10.5) - Safe area handling

- **Media & Features**

  - [expo-av](https://docs.expo.dev/versions/latest/sdk/audio/) (v14.0.7) - Audio/Video playback
  - [expo-speech](https://docs.expo.dev/versions/latest/sdk/speech/) (v12.0.2) - Text-to-speech
  - [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) (v15.1.0) - Image selection
  - [expo-web-browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/) (v13.0.3) - Web browser integration

- **Development Tools**
  - [Jest](https://jestjs.io/) (v29.2.1) - Testing framework
  - [ESLint](https://eslint.org/) - Code linting
  - [Babel](https://babeljs.io/) (v7.20.0) - JavaScript compiler

## 🛠️ Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- iOS Simulator (for Mac) or Android Studio (for Android development)
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository

   ```bash
   git clone [repository-url]
   cd ask-ai
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

### Development Options

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Expo Go**: Scan QR code with Expo Go app
- **Web**: Press `w` in the terminal

## 📱 Project Structure

```
ask-ai/
├── app/                 # Main application routes
│   ├── home/           # Home screen components
│   ├── onboarding/     # Onboarding flow
│   └── _layout.tsx     # Root layout
├── components/         # Reusable UI components
├── screens/           # Screen components
├── services/          # API and business logic
├── hooks/             # Custom React hooks
├── constants/         # Application constants
├── configs/           # Configuration files
└── assets/           # Static assets
```

## 🧪 Testing

Run tests using Jest:

```bash
npm test
```

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run reset-project` - Reset to a fresh project state
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [NativeWind Documentation](https://www.nativewind.dev/docs)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Community

- [Expo GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)
