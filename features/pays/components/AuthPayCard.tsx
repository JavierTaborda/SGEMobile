import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { dateMonthText } from "@/utils/datesFormat";
import {
  currencyDollar,
  currencyVES,
  totalVenezuela,
} from "@/utils/moneyFormat";
import { AuthPay } from "../types/AuthPay";

interface Props {
  item: AuthPay;
  selected?: boolean;
  selectionMode?: boolean;
  onSelect?: (auth: AuthPay) => void;
  onPress?: (item: AuthPay) => void;
}

export default function AuthPayCard({
  item,
  selected = false,
  selectionMode = false,
  onSelect,
  onPress,
}: Props) {
  const isAuth = item.autorizadopagar === "1";
  const currencyBs = item.monedaautorizada === "VED";

  /* ANIMATION VALUES (VISIBLE BY DEFAULT) */
  const checkboxTranslateX = useSharedValue(-12);
  const checkboxOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);

  /* Effecs to show /hide checkbox*/
  useEffect(() => {
    if (selectionMode) {
      checkboxTranslateX.value = withTiming(0, { duration: 300 });
      checkboxOpacity.value = withTiming(1, { duration: 150 });
    } else {
      checkboxTranslateX.value = withTiming(-12, { duration: 250 });
      checkboxOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [selectionMode]);

  useEffect(() => {
    cardScale.value = withTiming(selected ? 0.98 : 1, { duration: 150 });
  }, [selected]);

  /* ANIMATED STYLES*/
  const checkboxStyle = useAnimatedStyle(() => ({
    opacity: checkboxOpacity.value,
    transform: [{ translateX: checkboxTranslateX.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  /* HANDLERS*/
  const handlePress = () => {
    if (selectionMode) {
      onSelect?.(item);
    } else {
      onPress?.(item);
    }
  };

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPress={handlePress}
        className={`
          mb-4 rounded-2xl 
          ${
            selected
              ? "border border-primary bg-primary/5 dark:bg-dark-primary/10"
              : "bg-componentbg dark:bg-dark-componentbg"
          }
          
        `}
      >
        <View className={`flex-row ${selectionMode?`ps-1 `:`ps-4` } pe-4 py-4`}>
   
          {selectionMode && (
            <Animated.View
              style={checkboxStyle}
              className=" justify-center me-1"
            >
              <Pressable
                onPress={() => onSelect?.(item)}
                className={`
                  w-6 h-6 rounded-full border items-center justify-center
                  ${
                    selected
                      ? "bg-primary border-primary"
                      : "border-gray-400 dark:border-gray-500"
                  }
                `}
              >
                {selected && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="white"
                  />
                )}
              </Pressable>
            </Animated.View>
          )}

          {/*  CONTENT  */}
          <View className="flex-1 space-y-3">
            {/* Header */}
            <View className="flex-row justify-between items-start">
              <Text
                numberOfLines={2}
                className="flex-1 text-base font-bold text-foreground dark:text-dark-foreground"
              >
                {item.beneficiario}
              </Text>

              <View
                className={`
                  px-3 py-1 rounded-full
                  ${
                    isAuth
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-amber-500 dark:bg-yellow-900"
                  }
                `}
              >
                <Text
                  className={`
                    text-xs font-semibold
                    ${
                      isAuth
                        ? "text-green-700 dark:text-green-300"
                        : "text-white dark:text-yellow-300"
                    }
                  `}
                >
                  {isAuth ? "Autorizado" : "No Autorizado"}
                </Text>
              </View>
            </View>

            {/* Chips */}
            <View className="flex-row flex-wrap gap-2 mt-1">
              {[item.empresa, item.clasegasto].map(
                (label) =>
                  label && (
                    <View
                      key={label}
                      className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700"
                    >
                      <Text className="text-xs text-gray-600 dark:text-gray-300">
                        {label}
                      </Text>
                    </View>
                  )
              )}
            </View>

            {/* Meta */}
            <View className="space-y-1">
              {isAuth && (
                <Text className="text-sm  text-gray-500 dark:text-gray-400">
                  Autorizado con{" "}
                  <Text className="font-medium text-foreground dark:text-dark-foreground">
                    {item.metodopago} {item.empresapagadora} {item.bancopagador}
                  </Text>
                </Text>
              )}

              <Text className="text-sm  text-gray-500 dark:text-gray-400">
                Fecha{" "}
                <Text className="font-medium text-foreground dark:text-dark-foreground">
                  {dateMonthText(item.fechaemision)}
                </Text>
              </Text>
            </View>

            {/* Amounts */}
            <View className="rounded-xl bg-gray-50 dark:bg-gray-700 px-3 py-1 gap-y-1 my-1">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs  text-gray-500 dark:text-gray-400">
                    Total saldo
                  </Text>
                  <Text className="text-lg font-semibold text-black dark:text-white">
                    {totalVenezuela(item.montoneto)} {item.moneda}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className="text-xs  text-gray-500 dark:text-gray-400">
                    Tasa
                  </Text>
                  <Text className="text-sm font-medium text-black dark:text-white">
                    {totalVenezuela(item.tasacambio)}
                  </Text>
                </View>
              </View>

              {isAuth && (
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-xs  text-gray-500 dark:text-gray-400">
                      Monto autorizado
                    </Text>
                    <View className="flex-row gap-x-1 items-baseline">
                      <Text
                        className={`text-2xl font-black ${currencyBs ? `text-primary dark:text-green-400` : `text-green-500 dark:text-green-300`}`}
                      >
                        {currencyBs ? currencyVES : currencyDollar}
                      </Text>

                      <Text
                        className={`text-xl font-bold ${currencyBs ? `text-primary dark:text-green-400` : `text-green-500 dark:text-green-300`} `}
                      >
                        {totalVenezuela(item.montoautorizado)}{" "}
                        {item.monedaautorizada}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-xs  text-gray-500 dark:text-gray-400">
                      Tasa autorizada
                    </Text>
                    <Text className="text-sm font-medium pt-1 text-black dark:text-white">
                      {totalVenezuela(item.tasaautorizada)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Obs */}
            <View className="space-y-1">
              {!isAuth && (
                <View className="flex-row items-center">
                  <Text className="text-sm  text-gray-500 dark:text-gray-400 mr-2">
                    Preferible pagar
                  </Text>
                  <Text className="text-sm font-semibold text-black dark:text-white">
                    EURO TASA BCV
                  </Text>
                </View>
              )}
              <Text
                numberOfLines={3}
                className="text-xs  text-gray-500 dark:text-gray-400"
              >
                {item.observacion}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
