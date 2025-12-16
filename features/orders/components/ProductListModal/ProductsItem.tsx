import CustomImage from "@/components/ui/CustomImagen";
import { imageURL } from "@/utils/imageURL";
import { totalVenezuela } from "@/utils/moneyFormat";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { OrderApprovalProduct } from "../../types/OrderApproval";

type Props = {
  item: OrderApprovalProduct;
  index: number;
  currency: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
};


export default React.memo(function ProductListItem({
  item,
  index,
  currency,
  isExpanded,
  onToggleExpand,
}: Props) {
  const discount = item.porc_desc?.trim();
  const img = `${imageURL}${item.co_art?.trim()}.jpg`;
  const hasDiscount = discount !== "0" && discount?.trim().length > 0;

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleExpand();
  }, [onToggleExpand]);

  return (
    <View className="bg-white dark:bg-dark-componentbg rounded-2xl mb-2 shadow-sm shadow-black/10">
      <Pressable
        accessibilityLabel={`Producto ${item.art_des?.trim() ?? "Sin descripción"}`}
        onLongPress={handleLongPress}
      >
        <Animated.View
          className={`${isExpanded ? "p-3" : "p-3 flex-row items-center gap-4"}`}
        >
          {/* Imagen */}
          <Animated.View
            layout={LinearTransition.duration(180)}
            className={`${
              isExpanded
                ? "w-full h-60 mb-2 rounded-2xl"
                : "w-24 h-24 rounded-xl"
            } bg-bgimages justify-center items-center overflow-hidden`}
          >
            <CustomImage img={img} />
          </Animated.View>

          {/* info */}
          <View className="flex-1">
            <Text
              className="text-sm font-semibold text-foreground dark:text-dark-foreground"
              numberOfLines={isExpanded ? 6 : 3}
            >
              {item.co_art?.trim() ?? ""} -{" "}
              {item.art_des?.trim() ?? " SIN DESCRIPCIÓN"}
            </Text>

            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Almacén {item.co_alma?.trim()} {item.des_sub?.trim()}
            </Text>

            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Precio
              </Text>
              {hasDiscount ? (
                <>
                  <Text className="text-xs font-normal line-through text-gray-600 dark:text-gray-500">
                    {totalVenezuela(item?.prec_vta2)} {currency}
                  </Text>
                  <View className="bg-red-500/10 dark:bg-red-900 px-1 rounded-full border border-red-500">
                    <Text className="text-xs font-bold text-red-500 dark:text-red-400">
                      {discount}%
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {totalVenezuela(item?.prec_vta_desc)} {currency}
                  </Text>
                </>
              ) : (
                <Text className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {totalVenezuela(item?.prec_vta2)} {currency}
                </Text>
              )}
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Cantidad <Text className="font-medium">{item?.total_art}</Text>
              </Text>
              <View className="flex-row gap-x-1 justify-end items-end">
                <Text className=" text-sm  text-gray-600 dark:text-gray-400">
                  Total
                </Text>
                <Text className="text-md font-bold text-primary dark:text-dark-primary">
                  {totalVenezuela(item?.reng_neto)} {currency}
                </Text>
              </View>
            </View>
          </View>
          {isExpanded && (
            <Animated.View layout={LinearTransition}>
              <Pressable
                onPress={onToggleExpand}
                className="mt-2 self-end px-4 py-1.5 bg-primary dark:bg-dark-primary rounded-full"
              >
                <Text className="text-white font-semibold">Cerrar</Text>
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
});
