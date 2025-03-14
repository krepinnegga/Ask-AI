import { Audio } from "expo-av";
import { Alert } from "react-native";

/**
 * Request microphone permission
 * @returns boolean indicating whether permission was granted
 */
export const getMicrophonePermission = async (): Promise<boolean> => {
  try {
    const { granted } = await Audio.requestPermissionsAsync();

    if (!granted) {
      Alert.alert("Permission", "Please grant permission to access microphone");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Permission error:", error);
    return false;
  }
};

/**
 * Recording options for iOS and Android
 */
export const recordingOptions: any = {
  android: {
    extension: ".wav",
    outPutFormat: Audio.AndroidOutputFormat.MPEG_4,
    androidEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

/**
 * Start audio recording
 * @returns Audio.Recording object or null if recording failed
 */
export const startRecording = async (): Promise<Audio.Recording | null> => {
  const hasPermission = await getMicrophonePermission();
  if (!hasPermission) return null;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(recordingOptions);
    return recording;
  } catch (error) {
    console.error("Recording error:", error);
    Alert.alert("Error", "Failed to start recording");
    return null;
  }
};

/**
 * Stop audio recording
 * @param recording The recording object to stop
 * @returns URI of the recording or null if stopping failed
 */
export const stopRecording = async (
  recording: Audio.Recording | undefined
): Promise<string | null> => {
  if (!recording) return null;

  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    return recording.getURI() || null;
  } catch (error) {
    console.error("Stop recording error:", error);
    return null;
  }
};
