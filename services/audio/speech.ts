import * as Speech from "expo-speech";

/**
 * Options for text-to-speech
 */
export interface SpeechOptions {
  voice?: string;
  language?: string;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Default speech options
 */
export const defaultSpeechOptions: SpeechOptions = {
  voice: "com.apple.ttsbundle.Samantha-compact",
  language: "en-US",
  pitch: 1.5,
  rate: 1,
};

/**
 * Convert text to speech
 * @param text Text to speak
 * @param options Speech options
 */
export const speakText = async (
  text: string,
  options: SpeechOptions = defaultSpeechOptions
): Promise<void> => {
  try {
    Speech.speak(text, options as Speech.SpeechOptions);
  } catch (error) {
    console.error("Speech error:", error);
    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
};

/**
 * Stop all speech
 */
export const stopSpeaking = (): void => {
  try {
    Speech.stop();
  } catch (error) {
    console.error("Stop speech error:", error);
  }
};
