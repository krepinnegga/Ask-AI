import {
  Alert,
  StatusBar,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Image,
  Platform,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Audio } from "expo-av";
import LottieView from "lottie-react-native";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Services
import { transcribeAudio, generateContent, analyzeImage } from "@/services/api/gemini";
import { startRecording as startAudioRecording, stopRecording as stopAudioRecording } from "@/services/audio/recorder";
import { speakText, defaultSpeechOptions } from "@/services/audio/speech";

// Components
import RecordingButton from "@/components/AIAssistant/RecordingButton";

// Define the type for conversation history
interface ConversationMessage {
  role: "user" | "model";
  parts: { text: string }[];
  hasImage?: boolean;
  imageUri?: string;
}

export default function HomeScreen() {
  // State management
  const [text, setText] = useState("");
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [AIResponse, setAIResponse] = useState(false);
  const [AISpeaking, setAISpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        // Scroll to the bottom with a slight delay to ensure UI has updated
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        if (Platform.OS === 'ios') {
          // Add a small delay to ensure UI updates properly after keyboard closes
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 50);
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  /**
   * Start recording audio
   */
  const handleStartRecording = async () => {
    // Clear any existing image
    setSelectedImage(null);

    const newRecording = await startAudioRecording();
    if (newRecording) {
      setIsRecording(true);
      setRecording(newRecording);
    }
  };

  /**
   * Stop recording and process the audio
   */
  const handleStopRecording = async () => {
    try {
      setIsRecording(false);
      setLoading(true);

      if (!recording) {
        setLoading(false);
        return;
      }

      const uri = await stopAudioRecording(recording);

      if (!uri) {
        setLoading(false);
        Alert.alert("Error", "Failed to get recording");
        return;
      }

      // Create user message placeholder
      const userMessage: ConversationMessage = {
        role: "user",
        parts: [{ text: "🎤 Voice message" }]
      };

      // Update history with user's message
      const newHistory = [...history, userMessage];
      setHistory(newHistory);
      setAIResponse(true);

      // Send audio directly to Gemini
      const response = await generateContent(uri, history, 'audio');

      if (!response.error) {
        // Update UI with AI's response
        if (response.text) {
          const aiMessage: ConversationMessage = {
            role: "model",
            parts: [{ text: response.text }]
          };
          setHistory([...newHistory, aiMessage]);
          setText(response.text);

          // Speak the response
          await handleSpeakResponse(response.text);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Recording process error:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to process recording");
    }
  };

  /**
   * Handle text submission from the input field
   */
  const handleSendText = async () => {
    try {
      if (!inputText.trim() && !selectedImage) {
        return;
      }

      Keyboard.dismiss();
      setLoading(true);

      let userMessage: ConversationMessage;
      let response: { text: string; history: any[]; error?: boolean };

      // Handle image with or without text
      if (selectedImage) {
        userMessage = {
          role: "user",
          parts: [{ text: inputText.trim() || "Describe this image" }],
          hasImage: true,
          imageUri: selectedImage
        };

        // Update history with user's message
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setAIResponse(true);

        // Generate AI response for the image
        response = await analyzeImage(
          selectedImage,
          inputText.trim() || "Describe this image in detail",
          history
        );

        // Clear the image after sending
        setSelectedImage(null);
      } else {
        // Text-only message
        userMessage = {
          role: "user",
          parts: [{ text: inputText.trim() }]
        };

        // Update history with user's message
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        setAIResponse(true);

        // Generate AI response for the text
        response = await generateContent(inputText.trim(), history);
      }

      // Clear input field
      setInputText("");

      if (!response.error) {
        // Update UI with AI's response
        if (response.text) {
          const aiMessage: ConversationMessage = {
            role: "model",
            parts: [{ text: response.text }]
          };

          setHistory(prev => [...prev, aiMessage]);
          setText(response.text);

          // Speak the response
          await handleSpeakResponse(response.text);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Send text error:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to get response");
    }
  };

  /**
   * Pick an image from the library
   */
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setAIResponse(true);

        // Focus the text input for optional caption
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  /**
   * Take a photo with the camera
   */
  const handleTakePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== 'granted') {
        Alert.alert("Permission denied", "You need to grant camera permission to take photos");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setAIResponse(true);

        // Focus the text input for optional caption
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  /**
   * Regenerate response for the same text input
   */
  const handleRegenerateResponse = async () => {
    try {
      setLoading(true);

      // Get the last user message
      const lastUserMessage = history.filter(msg => msg.role === "user").pop();

      if (!lastUserMessage) {
        setLoading(false);
        return;
      }

      // Remove the last AI response from history
      const newHistory = history.filter(msg => msg !== history[history.length - 1]);
      setHistory(newHistory);

      // Generate new response
      let response;

      if (lastUserMessage.hasImage && lastUserMessage.imageUri) {
        // Regenerate with image
        response = await analyzeImage(
          lastUserMessage.imageUri,
          lastUserMessage.parts[0].text,
          newHistory
        );
      } else {
        // Regenerate with text
        response = await generateContent(lastUserMessage.parts[0].text, newHistory);
      }

      if (response.text) {
        const aiMessage: ConversationMessage = {
          role: "model",
          parts: [{ text: response.text }]
        };
        setHistory([...newHistory, aiMessage]);
        setText(response.text);
        setLoading(false);

        await handleSpeakResponse(response.text);
      }
    } catch (error) {
      console.error("Generate response error:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to generate response");
    }
  };

  /**
   * Speak the AI response
   */
  const handleSpeakResponse = async (responseText: string) => {
    setAISpeaking(true);

    await speakText(responseText, {
      ...defaultSpeechOptions,
      onDone: () => setAISpeaking(false),
      onError: (error) => {
        console.error("Speech error:", error);
        setAISpeaking(false);
      }
    });
  };

  /**
   * Reset the conversation
   */
  const handleReset = () => {
    setIsRecording(false);
    setAIResponse(false);
    setText("");
    setHistory([]);
    setSelectedImage(null);
    setInputText("");
  };

  // Handle lottie animation
  React.useEffect(() => {
    if (lottieRef.current) {
      if (AISpeaking) {
        lottieRef.current.play();
      } else {
        lottieRef.current.reset();
      }
    }
  }, [AISpeaking]);

  /**
   * Focus the text input field
   */
  const focusTextInput = () => {
    inputRef.current?.focus();
  };

  /**
   * Handle dismissing keyboard when tapping outside of input
   */
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Additional effect to ensure proper keyboard behavior
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (keyboardVisible && inputRef.current) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [keyboardVisible]);


  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View className="flex-1 pt-safe bg-gray-900">
        <StatusBar barStyle="light-content" />
        {/* Main Content */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Platform.OS === 'ios' ?
              (keyboardVisible ? 120 : 200) :
              (keyboardVisible ? 100 : 180)
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => {
            if (keyboardVisible) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          {!AIResponse ? (
            <View className="flex-1 justify-center items-center">
              <View className="bg-gray-800/30 p-6 rounded-3xl max-w-[300px]">
                <Text className="text-white text-lg font-semibold text-center mb-3">
                  Welcome to Ask AI
                </Text>
                <Text className="text-gray-400 text-center">
                  You can type a message, upload an image, or press the microphone button to start speaking. I'm here to help you with anything you need.
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-1 py-4">
              {loading ? (
                <View className="flex-1 justify-center items-center">
                  <LottieView
                    source={require("@/assets/animations/loading.json")}
                    autoPlay
                    loop
                    speed={1.3}
                    style={{ width: 200, height: 200 }}
                  />
                </View>
              ) : (
                <View className="flex-1">
                  {/* AI Speaking Animation */}
                  {AISpeaking && (
                    <View className="items-center mb-4">
                      <LottieView
                        ref={lottieRef}
                        source={require("@/assets/animations/ai-speaking.json")}
                        style={{ width: 120, height: 120 }}
                        autoPlay={false}
                        loop={false}
                      />
                    </View>
                  )}

                  {/* Conversation History */}
                  {history.map((message, index) => (
                    <View
                      key={index}
                      className={`mb-4 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <View
                        className={`rounded-2xl p-4 max-w-[85%] ${message.role === 'user'
                          ? 'bg-indigo-500 rounded-tr-none'
                          : 'bg-gray-800/50 backdrop-blur-lg rounded-tl-none'
                          }`}
                      >
                        {message.hasImage && message.imageUri && (
                          <Image
                            source={{ uri: message.imageUri }}
                            className="h-48 rounded-lg mb-2"
                            resizeMode="cover"
                          />
                        )}
                        <Text className="text-white text-base leading-relaxed">
                          {message.parts[0].text}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>


        {/* Bottom Actions Area - Floating */}
        <View
          className="absolute left-5 right-5 rounded-2xl bg-gray-800/90 border border-gray-700/50 shadow-lg backdrop-blur-md z-10"
          style={{
            bottom: Platform.OS === 'ios' ?
              (keyboardVisible ? 20 : 40) :
              (keyboardVisible ? 20 : 30),
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {/* Selected Image Preview */}

          {selectedImage && (
            <View className="mx-4 mb-2 bg-black/70 backdrop-blur-xl rounded-3xl p-2.5 flex-row items-center justify-between border border-gray-700/40 ">
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-11 h-11 rounded-lg"
                  resizeMode="cover"
                  style={{ borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' }}
                />
                <Text className="text-white text-sm flex-1 ml-3 mr-1">
                  Image selected. Add a caption or send as is.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className="h-7 w-7 rounded-full items-center justify-center ml-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <AntDesign name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Text Input and Action Buttons */}
          <View className="flex-row items-center p-3">
            <View className="flex-row items-center bg-gray-700/60 rounded-full flex-1 pl-4 pr-2 py-2 mr-2">
              <TextInput
                ref={inputRef}
                className="flex-1 text-white mr-2"
                style={{ maxHeight: 100 }}
                placeholder="Type a message..."
                placeholderTextColor="#9ca3af"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={true}
                returnKeyType="default"
                autoCorrect={true}
                keyboardAppearance="dark"
                onSubmitEditing={() => {
                  if (inputText.trim()) {
                    handleSendText();
                  }
                }}
                onFocus={() => {
                  setKeyboardVisible(true);
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
                onBlur={() => {
                  if (!inputText.trim() && !selectedImage) {
                    setKeyboardVisible(false);
                  }
                }}
              />
              <TouchableOpacity onPress={handlePickImage} className="p-1 mr-1">
                <Feather name="image" size={22} color="#818cf8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTakePhoto} className="p-1">
                <Feather name="camera" size={22} color="#818cf8" />
              </TouchableOpacity>
            </View>
            {inputText.trim().length > 0 || selectedImage ? (
              <TouchableOpacity
                onPress={handleSendText}
                className="bg-indigo-500 w-12 h-12 rounded-full items-center justify-center shadow-md"
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <RecordingButton
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
