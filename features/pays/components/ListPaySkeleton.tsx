import { Component } from "react";
import { View } from "react-native";

export default class ListPaySkeleton extends Component {
  render() {
    return (
      <View className="flex-1 px-5 py-2 rounded-t-3xl bg-background dark:bg-dark-background">
        <View className="w-full items-center">
          <View className="h-6 w-[75%] bg-gray-300 dark:bg-gray-700 rounded mt-1 mb-1 animate-pulse" />
        </View>
        <View>
          <View className="h-44 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse mb-4" />
        </View>
        <View>
          <View className="h-44 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse mb-4" />
        </View>
        <View>
          <View className="h-44 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse mb-4" />
        </View>
        <View>
          <View className="h-44 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse mb-4" />
        </View>
      </View>
    );
  }
}
