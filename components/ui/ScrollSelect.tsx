import { safeHaptic } from "@/utils/safeHaptics";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

interface FilterSelectorProps {
  label: string;
  selectedValue: string | undefined;
  options: string[] | any[];
  onSelect: (value: string) => void;
}

export default function ScrollSelect({
  label,
  selectedValue,
  options,
  onSelect,
}: FilterSelectorProps) {
  return (
    <>
      <Text className="mb-1 font-medium text-mutedForeground dark:text-dark-mutedForeground">
        {`${label}${selectedValue ? ": " + selectedValue : ""}`}
      </Text>
      <View className=" p-3  unded-xl mb-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === "web"}
        >
          {options.map((value) => (
            <Pressable
              key={value}
              className={`px-4 py-2 rounded-full border ${
                selectedValue === value
                  ? "bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary"
                  : "bg-transparent border-muted dark:border-dark-mutedForeground"
              } mr-2`}
              onPress={() => {
                onSelect(value);
                safeHaptic("soft");
              }}
            >
              <Text
                className={`text-sm ${
                  selectedValue === value
                    ? "text-white"
                    : "text-foreground dark:text-dark-foreground"
                }`}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );
}
