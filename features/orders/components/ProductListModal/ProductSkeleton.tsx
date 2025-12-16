import React from "react";
import { View } from "react-native";

export default function ProductSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-4 mb-4 animate-pulse"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-16 h-16 rounded-xl bg-gray-300 dark:bg-gray-600 mr-4" />
            <View className="flex-1 h-6 bg-gray-300 dark:bg-gray-600 rounded" />
          </View>
          <View className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4" />
          <View className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </View>
      ))}
    </>
  );
}
