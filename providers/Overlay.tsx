import { useOverlayStore } from "@/stores/useSuccessOverlayStore";
import { safeHaptic } from "@/utils/safeHaptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function Overlay() {
  const { visible, type, title, subtitle, hide } = useOverlayStore();
  const { width, height } = Dimensions.get("window");

  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      safeHaptic(type === "success" ? "success" : "error");
      progress.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      });
    } else {
      progress.value = withTiming(0, { duration: 300 });
    }
  }, [visible, type]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.85, 1]) }],
  }));

  //autohide

  useEffect(() => {
    if (visible) {
      const t = setTimeout(hide, 1500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  // config per type
  const configs = {
    success: {
      color: "bg-green-600 dark:bg-green-400",
      icon: "check",
      confetti: true,
    },
    error: {
      color: "bg-error dark:bg-dark-error",
      icon: "close",
      confetti: false,
    },
    warning: {
      color: " bg-yellow-500 dark:bg-yellow-400",
      icon: "alert",
      confetti: false,
    },
    info: {
      color: "bg-info dark:bg-dark-info",
      icon: "information",
      confetti: false,
    },
  } as const;

  type OverlayType = keyof typeof configs; // "success" | "error" | "warning" | "info"

  const config = configs[type as OverlayType];

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />

      <View pointerEvents="auto" style={StyleSheet.absoluteFillObject}>
        {/* BACKDROP */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backdropStyle]}
          className="bg-black/70"
        />

        {/* CONTENT */}
        <View className="flex-1 justify-center items-center">
          <Pressable onPress={hide}>
            <Animated.View
              style={[
                contentStyle,
                { width: width * 0.8, height: height * 0.4 },
              ]}
              className="bg-componentbg dark:bg-dark-componentbg rounded-3xl px-6 py-6 items-center gap-4 shadow-2xl justify-center"
            >
              <Animated.View
                className={` ${config.color} shadow-sm w-24 h-24 rounded-full mb-4 justify-center items-center`}
              >
                <MaterialCommunityIcons
                  name={config.icon}
                  size={48}
                  color="white"
                />
              </Animated.View>

              <Text className="text-2xl font-bold text-foreground dark:text-dark-foreground text-center">
                {title}
              </Text>
              {subtitle && (
                <Text className="text-base text-muted-foreground dark:text-dark-mutedForeground text-center">
                  {subtitle}
                </Text>
              )}
            </Animated.View>
          </Pressable>

          {/* CONFETTI  only in success */}
          {config.confetti && (
            <ConfettiCannon
              count={60}
              origin={{ x: width / 2, y: height / 2 }}
              fadeOut={true}
              autoStart={true}
              fallSpeed={1200}
              explosionSpeed={300}
            />
          )}
        </View>
      </View>
    </>
  );
}
