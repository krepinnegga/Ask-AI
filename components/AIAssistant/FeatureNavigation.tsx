import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface FeatureButton {
  title: string;
  icon: React.ReactNode;
  route: any; // Using any for now as the routes are dynamic
  description: string;
}

export default function FeatureNavigation() {
  const features: FeatureButton[] = [
    {
      title: 'Learning Hub',
      icon: <Ionicons name="school" size={24} className="text-indigo-500" />,
      route: '/(routes)/learning',
      description: 'Interactive learning with AI'
    },
    {
      title: 'Image Translation',
      icon: <MaterialIcons name="translate" size={24} className="text-indigo-500" />,
      route: '/(routes)/translation',
      description: 'Translate text from images'
    },
    {
      title: 'Chat Summary',
      icon: <FontAwesome5 name="clipboard-list" size={24} className="text-indigo-500" />,
      route: '/(routes)/summary',
      description: 'Summarize conversations'
    }
  ];

  return (
    <View className="px-4 py-6">
      <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        AI Features
      </Text>
      <View className="space-y-3">
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            onPress={() => router.push(feature.route)}
          >
            <View className="bg-indigo-50 dark:bg-indigo-900 rounded-full p-3 mr-4">
              {feature.icon}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                {feature.title}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              className="text-gray-400"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
