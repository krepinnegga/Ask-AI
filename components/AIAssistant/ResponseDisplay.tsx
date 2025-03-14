import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import LottieView from 'lottie-react-native';
import Regenerate from '@/assets/svgs/regenerate';
import Reload from '@/assets/svgs/reload';

interface ResponseDisplayProps {
  text: string;
  loading: boolean;
  streamingText: string;
  AISpeaking: boolean;
  AIResponse: boolean;
  onRegenerate: () => void;
  onSpeak: () => void;
}

/**
 * Component that displays the AI response text and controls
 */
const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  text,
  loading,
  streamingText,
  AISpeaking,
  AIResponse,
  onRegenerate,
  onSpeak,
}) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (AISpeaking) {
      lottieRef.current?.play();
    } else {
      lottieRef.current?.reset();
    }
  }, [AISpeaking]);

  return (
    <>
      {loading ? (
        <TouchableOpacity>
          <LottieView
            source={require("@/assets/animations/loading.json")}
            autoPlay
            loop
            speed={1.3}
            style={styles.loadingAnimation}
          />
        </TouchableOpacity>
      ) : (
        AIResponse && (
          <View>
            <LottieView
              ref={lottieRef}
              source={require("@/assets/animations/ai-speaking.json")}
              autoPlay={false}
              loop={false}
              style={styles.speakingAnimation}
            />
          </View>
        )
      )}

      <View style={styles.textContainer}>
        <Text style={styles.responseText}>
          {loading ? (streamingText || "...") : text || "Press the microphone to start recording!"}
        </Text>
      </View>

      {AIResponse && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={onRegenerate}>
            <Regenerate />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSpeak}>
            <Reload />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingAnimation: {
    width: scale(270),
    height: scale(270),
  },
  speakingAnimation: {
    width: scale(250),
    height: scale(250),
  },
  textContainer: {
    alignItems: "center",
    width: scale(350),
    position: "absolute",
    bottom: verticalScale(90),
  },
  responseText: {
    color: "#fff",
    fontSize: scale(16),
    width: scale(269),
    textAlign: "center",
    lineHeight: 25,
  },
  controlsContainer: {
    position: "absolute",
    bottom: verticalScale(40),
    left: 0,
    paddingHorizontal: scale(30),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: scale(360),
  },
});

export default ResponseDisplay;
