// components/CurrencySwitch.tsx
import { appTheme } from "@/utils/appTheme";
import { safeHaptic } from "@/utils/safeHaptics";
import { Pressable, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { CurrencyType } from "../hooks/useHomeScreen";

interface CurrencySwitchProps {
  currency: CurrencyType;
  onToggle: (currency: CurrencyType) => void;
  isDark: boolean;
}

export function CurrencySwitch({
  currency,
  onToggle,
  isDark,
}: CurrencySwitchProps) {
  const slideStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(currency === "USD" ? 0 : 50, {
          damping: 45,
          stiffness: 250,
        }),
      },
    ],
  }));

  const bgColor = isDark ? appTheme.dark.background : appTheme.background;
  const sliderColor = isDark ? appTheme.dark.componentbg : appTheme.componentbg;

  return (
    <View
      style={{
        overflow: "hidden",
        backgroundColor: bgColor,
        borderRadius: 8,
        height: 32,
        width: 104,
        flexDirection: "row",
        padding: 2,
        position: "relative",
      }}
    >
      {/* Slider */}
      <Animated.View
        style={[
          slideStyle,
          {
            position: "absolute",
            width: 50,
            height: 28,
            backgroundColor: sliderColor,
            borderRadius: 6,
            top: 2,
            left: 2,
            elevation: 2,
          },
        ]}
      />

      <Pressable
        onPress={() => {
          onToggle("USD");
          safeHaptic("selection");
        }}
        style={{
          width: 50,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color:
              currency === "USD"
                ? isDark
                  ? appTheme.dark.primary.DEFAULT
                  : appTheme.primary.DEFAULT
                : isDark
                  ? "#6B7280"
                  : "#9CA3AF",
          }}
          className="font-semibold text-sm "
        >
          USD
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {
          onToggle("VED");
          safeHaptic("selection");
        }}
        style={{
          width: 50,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color:
              currency === "VED"
                ? isDark
                  ? appTheme.dark.primary.DEFAULT
                  : appTheme.primary.DEFAULT
                : isDark
                  ? "#6B7280"
                  : "#9CA3AF",
          }}
          className="font-semibold text-sm "
        >
          Bs
        </Text>
      </Pressable>
    </View>
  );
}
