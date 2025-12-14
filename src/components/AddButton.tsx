import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface AddButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const AddButton: React.FC<AddButtonProps> = ({ onPress, disabled = false }) => {
  return (
    <View className="absolute bottom-8 left-0 right-0 items-center">
      <TouchableOpacity
        onPress={onPress}
        className="bg-white border-2 border-black rounded-full w-16 h-16 items-center justify-center shadow-lg active:bg-gray-50"
        disabled={disabled}
      >
        <Text className="text-black text-3xl font-light">+</Text>
      </TouchableOpacity>
    </View>
  );
};
