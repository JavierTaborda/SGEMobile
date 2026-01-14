import { useThemeStore } from "@/stores/useThemeStore";
import { appTheme } from "@/utils/appTheme";
import { safeHaptic } from "@/utils/safeHaptics";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  onClean: () => void;
  children?: React.ReactNode;
  title?: string;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  onClean,
  children,
  title = "Filtrar",
}: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeStore();
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 300, {
      duration: visible ? 300 : 250,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 300 : 250,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));


  const Clean = () => {
    safeHaptic("light");
    onClean();
  };
  const Apply = () => {
    safeHaptic("success");
    onApply();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <BlurView
        intensity={40}
        tint="dark"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Pressable
          className="flex-1"
          
          onPress={onClose}
        />
      </BlurView>

      <View className="flex-1 justify-end">
        <Animated.View
          style={[
            animatedStyle,
            {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 4,
              paddingBottom: insets.bottom,
              minHeight: "50%",
              maxHeight: "85%",
            },
          ]}
          className="rounded-t-3xl p-1 bg-background dark:bg-dark-background"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-1 px-4 py-4">
            <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
              {title}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={appTheme.mutedForeground}
              />
            </Pressable>
          </View>

          {children}

          {/* Buttons */}
          <View className="flex-row gap-3 mx-2 pb-2">
            <Pressable
              className="flex-1 p-3 rounded-xl border border-muted"
              onPress={Clean}
            >
              <Text className="text-center text-foreground dark:text-dark-foreground font-semibold">
                Limpiar
              </Text>
            </Pressable>

            <Pressable
              className="flex-1 p-3 rounded-xl bg-primary dark:bg-dark-primary"
              onPress={Apply}
            >
              <Text className="text-center text-white font-semibold">
                Aplicar
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
