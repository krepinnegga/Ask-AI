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
export const defaultSpeechOptions = {
  voice: "com.apple.ttsbundle.Samantha-compact",
  language: 'en',
  pitch: 1.0,
  rate: 0.9,
};

let isSpeaking = false;

/**
 * Convert text to speech
 * @param text Text to speak
 * @param options Speech options
 */
export const speakText = async (
  text: string,
  options?: Speech.SpeechOptions
): Promise<void> => {
  try {
    // Stop any ongoing speech
    if (isSpeaking) {
      await Speech.stop();
      isSpeaking = false;
    }

    // Start new speech
    isSpeaking = true;
    await Speech.speak(text, {
      ...defaultSpeechOptions,
      ...options,
      onStart: () => {
        options?.onStart?.();
      },
      onDone: () => {
        isSpeaking = false;
        options?.onDone?.();
      },
      onError: (error) => {
        isSpeaking = false;
        options?.onError?.(error);
      },
    });
  } catch (error) {
    console.error("Speech error:", error);
    isSpeaking = false;
    throw error;
  }
};

/**
 * Stop all speech
 */
export const stopSpeaking = async (): Promise<void> => {
  try {
    if (isSpeaking) {
      await Speech.stop();
      isSpeaking = false;
    }
  } catch (error) {
    console.error("Stop speech error:", error);
    isSpeaking = false;
    throw error;
  }
};
