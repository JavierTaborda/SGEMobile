import { safeHaptic } from "@/utils/safeHaptics";
import { memo } from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";

type ToggleSelectorProps = {
  startMethod: "serial" | "fact";
  setStartMethod: (m: "serial" | "fact") => void;
  animatedStyle: any;
  animatedStyleToggle: any;
  emojis: any;
};

const ToggleSelector = memo(
  ({
    startMethod,
    setStartMethod,
    animatedStyle,
    animatedStyleToggle,
    emojis,
  }: ToggleSelectorProps) => (
    <Animated.View
      style={animatedStyleToggle}
      className="relative flex-row bg-muted dark:bg-dark-muted rounded-full p-1 mb-1 overflow-hidden"
    >
      <Animated.View
        style={[animatedStyle]}
        className="absolute left-1 top-1 w-1/2 h-full bg-primary dark:bg-dark-primary rounded-full"
      />
      {[
        { key: "serial", label: `Serial` },
        { key: "fact", label: ` Factura` },
      ].map(({ key, label }) => {
        const active = startMethod === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => {
              safeHaptic("selection");
              setStartMethod(key as "serial" | "fact");
            }}
            className="flex-1 py-1 rounded-xl items-center z-10"
          >
            <Text
              className={`font-semibold text-base ${
                active
                  ? "text-white"
                  : "text-foreground dark:text-dark-foreground"
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  )
);

export default ToggleSelector;
