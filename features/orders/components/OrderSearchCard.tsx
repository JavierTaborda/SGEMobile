import { appTheme } from "@/utils/appTheme";
import { formatDatedd_dot_MMM_yyyy } from "@/utils/datesFormat";
import { currencyDollar, totalVenezuela } from "@/utils/moneyFormat";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeStore } from "@/stores/useThemeStore";

import { safeHaptic } from "@/utils/safeHaptics";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { OrderApproval } from "../types/OrderApproval";

interface Props {
  item: OrderApproval;
  onPress?: () => void;
  detailModal?: () => void;
  hasPermission: boolean;
  markComment: (
    fact_num: number,
    newComment: string,
    ven_des: string
  ) => Promise<boolean>;
}

function OrderSearchCard({
  item,
  onPress,
  detailModal,
  hasPermission,
  markComment,
}: Props) {
  const isAnulada = item.anulada === true;
  const isSwitchable = item.estatus !== "2";
  const formattedDate = useMemo(
    () => formatDatedd_dot_MMM_yyyy(item.fec_emis),
    [item.fec_emis]
  );

  const handlePressInfoModal = () => {
    onPress?.();
  };

  const handlePressDetailsModal = () => {
    detailModal?.();
  };
  const [isFacturable, setIsFacturable] = useState(
    item.comentario.startsWith("**") === true
  );
  const [switchLoad, setSwitchLoad] = useState<boolean>(false);
  const { isDark } = useThemeStore();

  const handleswitch = async (value: boolean) => {
    try {
      setSwitchLoad(true);
      let newComment = item.comentario;

      if (value && !item.comentario.startsWith("**")) {
        newComment = `**${item.comentario}`;
      } else if (!value && item.comentario.startsWith("**")) {
        newComment = item.comentario.slice(2);
      } else if (!value && !item.comentario.startsWith("**")) {
        Alert.alert("Este pedido no está marcado con **");
        return;
      }

      const result = await markComment(
        item.fact_num,
        newComment,
        item?.ven_des
      );

      if (result) {
        item.comentario = newComment;
        setIsFacturable(value);
      }
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
    } finally {
      setSwitchLoad(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).damping(200).springify()}
      exiting={FadeOut.duration(100)}
      className={`rounded-xl py-2 px-3 mb-2 border shadow-sm shadow-black/10 ${
        isAnulada
          ? "bg-red-50 dark:bg-dark-error/20 border-red-300 dark:border-red-300"
          : "bg-componentbg dark:bg-dark-componentbg border-gray-200 dark:border-gray-700"
      }`}
    >
      <Pressable className="flex-row gap-2" style={{ minHeight: 110 }}>
        {/* Band Anulado */}
        {isAnulada && (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="absolute top-1 right-2 bg-red-500/80 dark:bg-red-600/50 rounded-full px-2 z-10"
          >
            <Text className="text-xs text-white font-bold">Anulado</Text>
          </Animated.View>
        )}

        <Pressable
          className="flex-1 gap-1 w-4/6"
          onPress={handlePressInfoModal}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground">
              Pedido #{item.fact_num}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Ionicons name="person-outline" size={14} color="gray" />
            <Text
              className="text-base text-foreground dark:text-dark-foreground flex-shrink"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.co_cli.trim()} - {item.cli_des}
            </Text>
          </View>

          <View className="flex-row items-center justify-normal gap-2">
            <Text className="text-sm pt-1 text-gray-500 dark:text-gray-400">
              Total
            </Text>
            <Text
              className={`text-xl font-bold ${
                isAnulada
                  ? "line-through text-error dark:text-dark-error"
                  : "text-primary dark:text-dark-primary"
              }`}
            >
              {totalVenezuela(item.tot_neto)} {currencyDollar}
            </Text>
          </View>

          {hasPermission ? (
            <View className="flex-row items-center gap-2">
              <Text className="text-xs font-normal text-gray-500 dark:text-gray-400">
                {item.zon_des.trim()} - {item.ven_des.trim()}
              </Text>
            </View>
          ) : null}
        </Pressable>

        {/* Botón Ver Detalles */}
        <View className="flex-col  justify-center w-2/6">
          {/* Botón de detalles */}
          <TouchableOpacity
            onPress={handlePressDetailsModal}
            className="flex-row items-center justify-center px-4 py-2 rounded-full bg-primary dark:bg-dark-primary active:scale-95"
            style={{ minWidth: 100 }}
          >
            <Text className="text-sm font-semibold text-white">
              Ver detalles
            </Text>
          </TouchableOpacity>

          {/* Switch */}
          {isSwitchable && (
            <View className="items-center  mt-5 gap-0">
              <View className="w-[50] h-[35]  justify-center">
                {switchLoad ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      isDark
                        ? appTheme.dark.tertiary.DEFAULT
                        : appTheme.tertiary.DEFAULT
                    }
                  />
                ) : (
                  <Switch
                    value={isFacturable}
                    onValueChange={(val) => {
                      handleswitch(val);
                      Platform.OS === "android" ? safeHaptic("soft") : null;
                    }}
                    {...(Platform.OS === "android"
                      ? {
                          thumbColor: isFacturable
                            ? isDark
                              ? appTheme.dark.tertiary.DEFAULT
                              : appTheme.tertiary.DEFAULT
                            : isDark
                              ? appTheme.dark.mutedForeground
                              : appTheme.muted,
                          trackColor: {
                            false: isDark
                              ? appTheme.dark.mutedForeground
                              : appTheme.muted,
                            true: isDark
                              ? appTheme.dark.tertiary.DEFAULT
                              : appTheme.tertiary.DEFAULT,
                          },
                        }
                      : {
                          trackColor: {
                            true: isDark
                              ? appTheme.dark.tertiary.DEFAULT
                              : appTheme.tertiary.DEFAULT,
                          },
                        })}
                  />
                )}
              </View>

              <Text
                className={`text-sm mt-0 ${
                  isFacturable
                    ? "font-semibold text-tertiary dark:text-dark-tertiary"
                    : "font-normal text-gray-400   dark:text-gray-500"
                }`}
              >
                {isFacturable ? "Facturar" : "Facturar"}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(OrderSearchCard);
