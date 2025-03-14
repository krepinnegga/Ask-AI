import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

interface RecordingButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

/**
 * Recording button component
 * Shows a microphone button when not recording and an animation when recording
 */
const RecordingButton: React.FC<RecordingButtonProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording
}) => {
  return (
    <View className="items-center">
      {isRecording ? (
        <TouchableOpacity
          onPress={onStopRecording}
          className="w-24 h-24 items-center justify-center"
        >
          <LottieView
            source={require("@/assets/animations/animation.json")}
            autoPlay
            loop
            speed={1.3}
            style={{ width: 80, height: 80 }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="w-24 h-24 rounded-full items-center justify-center shadow-lg"
          onPress={onStartRecording}
          style={{ width: 40, height: 40 }}
        >
          <FontAwesome
            name="microphone"
            size={32}
            color="#ffffff"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RecordingButton;
