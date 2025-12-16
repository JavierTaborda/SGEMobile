import BottomModal from "@/components/ui/BottomModal";
import { currencyDollar, currencyVES, totalVenezuela } from "@/utils/moneyFormat";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, {
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import { OrderItem } from "../types/orderItem";
import { calculateTotals } from "../utils/calculateTotals";
import ItemModal from "./ItemModal";

type Props = {
  scrollEnabled?: boolean;
};

export default function OrderSummaryList({ scrollEnabled = true }: Props) {
  const { items, removeItem, setTotalsVES, exchangeRate, totalsVES,IVA } =
    useCreateOrderStore();
  const [modalItemVisible, setModalItemVisible] = useState(false);
  const [item, setItem] = useState<OrderItem>({} as OrderItem);

  const handleOpenItem = (item: OrderItem) => {
    setItem(item);
    setModalItemVisible(true);
  };

  return (
    <>
      <Animated.ScrollView
        layout={LinearTransition.springify()}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {items.map((item) => {
          const { subtotal, total, finalUnitPrice } = calculateTotals(
            item.price,
            item.quantity ?? 1,
            item.discount ?? "",
            IVA
          );
          const itemPrice = totalVenezuela(
            totalsVES ? item.price * exchangeRate.tasa_v : item.price
          );
          const finalPrice = totalVenezuela(
            totalsVES ? finalUnitPrice * exchangeRate.tasa_v : finalUnitPrice
          );
          const totalPrice = totalVenezuela(
            totalsVES ? total * exchangeRate.tasa_v : total
          );
          const currency = totalsVES ? currencyVES: currencyDollar;
          return (
            <Animated.View
              key={item.codart}
              exiting={FadeOutLeft.duration(200)}
              layout={LinearTransition.springify()}
              className="my-1"
            >
              <Pressable
                onPress={() => handleOpenItem(item)}
                className="flex-row items-center py-2 px-3 rounded-xl bg-componentbg dark:bg-dark-componentbg"
              >
                <Image
                  source={{ uri: item.img }}
                  className="w-20 h-20 rounded-xl bg-gray-200"
                />

                <View className="flex-1 ml-2">
                  <Text
                    className="text-sm font-normal text-gray-900 dark:text-gray-100"
                    numberOfLines={2}
                  >
                    {item.codart?.trim()} - {item.artdes?.trim()}
                  </Text>

                  <Text className="text-sm text-gray-500">Almacén 0001</Text>

                  <View className="flex-row items-center space-x-2">
                    {item.discount ? (
                      <>
                        <Text className="text-sm line-through text-gray-500">
                          {itemPrice} {currency}
                        </Text>
                        <View className="mx-2 bg-red-500/10 dark:bg-red-900 px-1 rounded-full border border-red-500">
                          <Text className="text-xs font-bold text-red-500 dark:text-red-400">
                            {item.discount}%
                          </Text>
                        </View>
                      </>
                    ) : null}

                    <Text className="text-sm font-semibold text-primary dark:text-dark-primary">
                      {finalPrice} {currency}
                    </Text>
                  </View>

                  <View className="flex-row justify-between mt-1 items-center">
                    <Text className="text-sm text-gray-800 dark:text-gray-200">
                      Cantidad {item.quantity}
                    </Text>

                    <View className="flex-row">
                      <Text className="text-sm text-gray-800 dark:text-gray-300">
                        Total{" "}
                      </Text>
                      <Text className="text-md font-semibold text-primary dark:text-dark-primary">
                        {totalPrice} {currency}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setTimeout(() => removeItem(item.codart), 200);
                  }}
                  className="p-2"
                >
                  <Ionicons name="trash" size={22} color="grey" />
                </Pressable>
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      <BottomModal
        visible={modalItemVisible}
        onClose={() => setModalItemVisible(false)}
        heightPercentage={0.85}
      >
        <ItemModal onClose={setModalItemVisible} item={item} />
      </BottomModal>
    </>
  );
}
