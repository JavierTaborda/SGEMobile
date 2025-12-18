import { useSuccessOverlayStore } from "@/stores/useSuccessOverlayStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

export default function SuccessOverlay() {
  const { visible, title, subtitle, hide } = useSuccessOverlayStore();

  // Anim values
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const contentOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // in / out
  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });

      contentOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, {
        damping: 16,
        stiffness: 130,
      });

      glowOpacity.value = withTiming(1, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      contentOpacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9);
      glowOpacity.value = withTiming(0);
    }
  }, [visible]);

  //Auto hide
  useEffect(() => {
    if (visible) {
      const t = setTimeout(hide, 1200);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

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
          style={glowStyle}
          className="absolute  rounded-full bg-green-400/30 blur-3xl"
        />


        <View  className="flex-1 justify-center items-center ">
          <Animated.View
            style={contentStyle}
            className="bg-componentbg dark:bg-dark-componentbg rounded-3xl px-5 py-2 items-center gap-4 shadow-2xl"
          >
            <View className="w-16 h-16 rounded-full bg-green-500 items-center justify-center">
              <MaterialCommunityIcons name="check" size={36} color="white" />
            </View>

            <Text className="text-lg font-bold text-foreground text-center">
              {title}
            </Text>

            {subtitle && (
              <Text className="text-sm text-muted-foreground text-center">
                {subtitle}
              </Text>
            )}
          </Animated.View>
        </View>
      </View>
    </>
  );
}

