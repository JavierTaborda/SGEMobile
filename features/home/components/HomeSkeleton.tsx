import { Component } from "react";
import { View } from "react-native";

export default class HomeSkeleton extends Component {
  render() {
    return (
      <View className="flex-1 p-4 pt-2 bg-background dark:bg-dark-background">
        <View className="h-6 w-2/3 bg-gray-300 dark:bg-gray-700 rounded mt-2 mb-4 animate-pulse" />

        <View className="flex-row justify-between mb-4 gap-2">
          <View className="flex-1 h-24 rounded-lg p-4 bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="flex-1 h-24 rounded-lg p-4  bg-gray-300 dark:bg-gray-700 animate-pulse" />
          <View className="flex-1 h-24 rounded-lg p-4 bg-gray-300 dark:bg-gray-700 animate-pulse" />
        </View>

        <View>
          <View className="h-[350px] w-full mb-5 bg-gray-300 dark:bg-gray-700 rounded-3xl animate-pulse" />
        </View>

        <View className="flex-col gap-3 h-[300px] w-full">
          <View className="h-24 rounded-lg  mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse w-full" />
          <View className="h-24 rounded-lg  mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse w-full" />
          <View className="h-24 rounded-lg  mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse w-full" />
          <View className="h-24 rounded-lg  mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse w-full" />
          <View className="flex-row justify-between mt-mb-1">
            <View className="flex-1 h-24 rounded-lg  mr-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
            <View className="flex-1 h-24 rounded-lg  ml-2 bg-gray-300 dark:bg-gray-700 animate-pulse" />
          </View>
        </View>
      </View>
    );
  }
}
