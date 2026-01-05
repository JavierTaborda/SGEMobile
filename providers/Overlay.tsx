import { useSuccessOverlayStore } from "@/stores/useSuccessOverlayStore";
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
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function SuccessOverlay() {
  const { visible, title, subtitle, hide } = useSuccessOverlayStore();
  const { width, height } = Dimensions.get("window");

  // ---------- Shared values ----------
  const backdropOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.85);
  const contentOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  // ---------- Animaciones ----------
  useEffect(() => {
    if (visible) {
      safeHaptic("success");
      backdropOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
      contentOpacity.value = withTiming(1, { duration: 300 });
      contentScale.value = withSpring(1, { damping: 20, stiffness: 100 });
      glowOpacity.value = withTiming(1, { duration: 600 });
      checkScale.value = withSpring(1.05, { damping: 15, stiffness: 120 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      contentOpacity.value = withTiming(0, { duration: 200 });
      contentScale.value = withTiming(0.95, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 300 });
      checkScale.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  // ---------- Animated styles ----------
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      {
        scale: interpolate(glowOpacity.value, [0, 1], [0.9, 1.3]),
      },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  // // ---------- Auto-hide ----------
  useEffect(() => {
    if (visible) {
      const t = setTimeout(hide, 1500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />

      <View pointerEvents="auto" style={StyleSheet.absoluteFillObject}>
        {/* BACKDROP */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, backdropStyle]}
          className="bg-black/70"
        />

        {/* GLOW */}
        <Animated.View
          className="absolute w-full h-full bg-primary/30 dark:bg-dark-primary/30"
          style={glowStyle}
        />

        {/* CONFETTI */}

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
                className="bg-green-600 dark:bg-green-400 shadow-sm w-24 h-24 rounded-full mb-4 justify-center items-center"
                style={checkStyle}
              >
                <MaterialCommunityIcons name="check" size={48} color="white" />
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
          {visible && (
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
