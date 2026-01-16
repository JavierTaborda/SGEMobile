import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import SplashScreen from "@/components/SplashScreen";
import { supabase } from "@/lib/supabase";
import { useAuthProviderStore } from "@/stores/useAuthProviderStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useThemeStore } from "@/stores/useThemeStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrate } = useThemeStore();
  const { showSplash, initializeApp } = useAuthProviderStore();

  // valores compartidos en Reanimated
  const splashOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);


  const splashStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    opacity: splashOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    opacity: contentOpacity.value,
  }));

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "TOKEN_REFRESHED" && session) {
          useAuthStore.getState().setSession(session);
          useAuthStore.getState().setToken(session.access_token);
        }
      }
    );
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // init de la app
  useEffect(() => {
    if (!isMounted) return;

    const init = async () => {
      try {
        await new Promise((res) => setTimeout(res, 500)); // delay pequeño
        await hydrate();
        await initializeApp();
      } catch (e) {
        console.log("Error initializing app:", e);
      }
    };
    init();
  }, [isMounted]);

  // animaciones splash → contenido
  useEffect(() => {
    if (!showSplash) {
      splashOpacity.value = withTiming(0, {
        duration: 400,
        easing: Easing.ease,
      });
      contentOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.ease,
      });
    }
  }, [showSplash]);

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
      {showSplash && (
        <Animated.View style={splashStyle}>
          <SplashScreen />
        </Animated.View>
      )}
      {!showSplash && (
        <Animated.View style={contentStyle}>{children}</Animated.View>
      )}
    </View>
  );
}
