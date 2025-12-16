import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import { Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useThemeStore } from "@/stores/useThemeStore";
import { safeHaptic } from "@/utils/safeHaptics";
import { useOrderTotals } from "../hooks/useOrderTotals";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import ExchangeRateBadge from "./ExchangeRateBadge";
import OrderSummaryList from "./OrderSummaryList";
import TotalView from "./TotalView";

const { height, width } = Dimensions.get("window");

type OrderModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const OrderModal: React.FC<OrderModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const { items, clearOrder, exchangeRate } = useCreateOrderStore();
  const { isDark } = useThemeStore();
  const { totalGross, total, TotalIVA, totalWithIVA, discountAmount } =
    useOrderTotals(items);

  const isEmpty = items.length === 0;

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
  const handleRemove = () => {
    safeHaptic("warning");
    Alert.alert("¿Desea descartar el pedido?", "", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Descartar",
        style: "destructive",
        onPress: () => {
          clearOrder();
          onClose();
        },
      },
    ]);
  };

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
        <View className="flex-1 rounded-3xl bg-background dark:bg-dark-background px-5 pt-2 pb-3 shadow-lg backdrop-blur-md">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center space-x-2">
              <Ionicons
                name="bag-handle"
                size={26}
                color={isDark ? "#fff" : "#000"}
              />
              <View className="ml-2">
                <Text className="text-xl font-extrabold text-foreground dark:text-dark-foreground">
                  Resumen
                </Text>
                <Text className="text-md font-semibold text-gray-500 dark:text-gray-400">
                  {items?.length} {items?.length > 1 ? "artículos" : "artículo"}
                </Text>
              </View>
            </View>
            <ExchangeRateBadge exchangeRate={exchangeRate} onPress={() => {}} />
          </View>

          {items.length === 0 ? (
            <>
              <View className="flex-1 justify-center items-center">
                <Ionicons name="bag-outline" size={42} color="#aaa" />
                <Text className="text-base text-gray-400 mt-2">
                  No tienes productos.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="py-4 rounded-full items-center bg-gray-300 dark:bg-gray-700"
              >
                <Text className="text-white font-semibold text-base">
                  Cerrar
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <OrderSummaryList />

              <View className="mt-2 pt-2 border-t border-gray-300/30 dark:border-white/10">
                <View className="space-y-1 mb-2">
                  <TotalView
                    total={total}
                    totalWithIVA={totalWithIVA}
                    TotalIVA={TotalIVA}
                    exchangeRate={exchangeRate}
                  />
                </View>

                <View className="flex-row items-center space-x-3  gap-1 ">
                  <TouchableOpacity
                    disabled={isEmpty}
                    onPress={onConfirm}
                    className={`flex-1 py-4 rounded-full items-center ${
                      isEmpty
                        ? "bg-gray-300 dark:bg-gray-700"
                        : "bg-primary dark:bg-dark-primary"
                    }`}
                  >
                    <View className="flex-row">
                      <Ionicons
                        name="checkmark-sharp"
                        size={24}
                        color="white"
                      />
                      <Text className="text-lg font-semibold text-white">
                        Confirmar
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      handleRemove();
                    }}
                    disabled={isEmpty}
                    className={`p-4 rounded-full ${
                      isEmpty
                        ? "bg-gray-300 dark:bg-gray-700"
                        : "bg-red-500 dark:bg-red-600"
                    }`}
                  >
                    <Ionicons name="trash" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="p-1 bg-componentbg dark:bg-dark-componentbg rounded-full
             absolute right-2 top-2"
          >
            <Ionicons name="close" size={20} color="#555" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default OrderModal;
