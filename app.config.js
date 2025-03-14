export default {
  "expo": {
    "name": "Ask Ai",
    "slug": "ask-ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon2.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.krepinnegga.ask-ai",
      "infoPlist": {
        "NSMicrophoneUsageDescription": "This app requires access to your microphone to record audio for to talk to AI.",
        "NSPhotoLibraryUsageDescription": "Allow access to your photo library to select images for translation.",
        "NSCameraUsageDescription": "Allow access to your camera to capture images for translation."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      "package": "com.krepinnegga.askai"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-av",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow access to your photo library to select images for translation.",
          "cameraPermission": "Allow access to your camera to capture images for translation.",
          "microphonePermission": false
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "EXPO_PUBLIC_BASE_URL": process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    }
  }
}
