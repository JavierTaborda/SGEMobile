import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import {
  Dimensions,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import { emojis } from "@/utils/emojis";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import { OrderItem } from "../types/orderItem";

const { height, width } = Dimensions.get("window");

type OrderModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: OrderItem;
};

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  onClose,
  onConfirm,
  item
}) => {
  const { items } = useCreateOrderStore();

  const total = items.reduce(
    (acc, item) => acc + item.price * (item.quantity ?? 1),
    0
  );

  // Reanimated setup
  const translateY = useSharedValue(height);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : width, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      <BlurView intensity={50} tint="dark" className="absolute inset-0">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
      </BlurView>

      <Animated.View
        style={[
          {
            position: "absolute",
            right: 0,
            bottom: 100,
            height: height * 0.7,
            width: "100%",
            padding: 10,
          },
          animatedStyle,
        ]}
      >
        <View className="flex-1 rounded-3xl bg-componentbg dark:bg-dark-componentbg p-5 shadow-lg backdrop-blur-md">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-foreground dark:text-dark-foreground">
              {emojis.bags} Tu Pedido
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className=" bg-slate-200 dark:bg-slate-100 rounded-full"
            >
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Item */}

          {/* Footer */}
          <View className="border-t border-white/30 mt-1">
            
            <TouchableOpacity
              className={`rounded-full py-4 items-center ${
                items.length === 0
                  ? "bg-gray-400"
                  : "bg-primary dark:bg-dark-primary"
              }`}
              disabled={items.length === 0}
              onPress={onConfirm}
            >
              <Text className="text-white text-base font-semibold">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default OrderModal;