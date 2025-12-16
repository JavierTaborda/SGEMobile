import CustomTextInput from "@/components/inputs/CustomTextInput";
import CustomImage from "@/components/ui/CustomImagen";
import { imageURL } from "@/utils/imageURL";
import { currencyDollar, totalVenezuela } from "@/utils/moneyFormat";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import { OrderItem } from "../types/orderItem";
import QuantitySelector from "./QuantitySelector";

type ItemModalProps = {
  visible?: boolean;
  onClose: (close: boolean) => void;
  item?: OrderItem;
};

const PRESET_DISCOUNTS = [5, 10, 15, 20, 25, 30, 35, 40];

const ItemModal: React.FC<ItemModalProps> = ({ onClose, item }) => {
  const [discountPercent, setDiscountPercent] = useState<string>("");

  const cartItem = useCreateOrderStore((s) =>
    s.items.find((i) => i.codart === item?.codart)
  );

  const { addItem, IVA } = useCreateOrderStore();

  const price = Number(item?.price ?? 0);
  const quantity = cartItem?.quantity ?? 0;
  const available = item?.available ?? 0;

  const img = `${imageURL}${item?.codart?.trim()}.jpg`;

  useEffect(() => {
    if (cartItem?.discount !== undefined) {
      setDiscountPercent(cartItem.discount.toString());
    }
  }, [cartItem?.discount]);

  const discountsArray = useMemo(() => {
    if (!discountPercent.trim()) return [];
    return discountPercent
      .split("+")
      .map((d) => Number(d.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  }, [discountPercent]);

  const finalUnitPrice = useMemo(() => {
    let current = price;
    discountsArray.forEach((percent) => {
      current = current * (1 - percent / 100);
    });
    return current;
  }, [price, discountsArray]);

  const discountPerUnit = useMemo(
    () => price - finalUnitPrice,
    [price, finalUnitPrice]
  );

  const totalGross = useMemo(() => price * quantity, [price, quantity]);

  const totalDiscount = useMemo(
    () => discountPerUnit * quantity,
    [discountPerUnit, quantity]
  );

  const subtotal = useMemo(
    () => finalUnitPrice * quantity,
    [finalUnitPrice, quantity]
  );

  const iva = useMemo(() => subtotal * IVA, [subtotal]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  const handleDiscountToggle = (percent: number) => {
    const current = discountPercent
      .split("+")
      .filter((d) => d.trim() !== "")
      .map((d) => Number(d));

    if (!current.includes(percent) && current.length < 3) {
      setDiscountPercent([...current, percent].join("+"));
    } else if (current.includes(percent)) {
      setDiscountPercent(current.filter((d) => d !== percent).join("+"));
    } else {
        Alert.alert("No se pueden aplicar más de 3 descuentos", "", [
          { text: "Aceptar" },
        ]);
    }
  };

  const handleChangeDiscount = (text: string) => {
    if (!/^[0-9+]*$/.test(text)) return;

    const cleaned = text.replace(/\+\+/g, "+");

    const discounts = cleaned.split("+").filter(Boolean).map(Number);

    if (discounts.length > 3) {
      Alert.alert("No se pueden aplicar más de 3 descuentos", "", [{ text: "Aceptar" }]);
      return;
    }
    setDiscountPercent(cleaned);
  };

  const handleAddItem = () => {
    if (!cartItem) {
      Alert.alert("Error", "No hay item seleccionado para agregar.");
      return;
    }

    const itemToAdd = {
      ...cartItem,
      discount: discountPercent,
    };

    addItem(itemToAdd, 0);
    onClose(false);
  };

  return (
    <View className="flex-1 gap-3 py-2">
      <View className="flex-row bg-componentbg dark:bg-dark-componentbg rounded-2xl p-2 gap-2">
        <View
          className="w-32 h-32 my-2 rounded-xl overflow-hidden bg-bgimages mr-3 
             items-center justify-center"
        >
          <CustomImage img={img} />
        </View>

        <View className="flex-1 justify-between gap-y-1">
          <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground">
            {item?.codart}
          </Text>

          <Text
            className="text-sm text-foreground dark:text-dark-foreground leading-snug"
            numberOfLines={3}
          >
            {item?.artdes}
          </Text>

          <View className=" px-2 py-1 rounded-full bg-primary/15 dark:bg-primary/25 self-start">
            <Text className="text-primary dark:text-dark-primary font-semibold text-sm">
              {available - quantity} disponibles
            </Text>
          </View>

          <View className="flex-row  overflow-hidden gap-1">
            {discountsArray.length > 0 && (
              <>
                <Text className="text-md line-through text-gray-500 dark:text-gray-300 mx-1">
                  {totalVenezuela(price)} {currencyDollar}
                </Text>
                <View className="bg-red-500/10 dark:bg-red-900 px-1 rounded-full border border-red-500">
                  <Text className="text-xs font-bold text-red-500 dark:text-red-400">
                    {discountPercent} %
                  </Text>
                </View>
              </>
            )}

            <Text className="text-md font-bold text-primary dark:text-dark-primary">
              {totalVenezuela(finalUnitPrice)} {currencyDollar}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-componentbg dark:bg-dark-componentbg p-4 rounded-2xl">
        <View className="w-full items-center mb-5">
          <QuantitySelector
            codart={item!.codart}
            quantity={quantity}
            available={item!.available}
            artdes={item!.artdes}
            price={item!.price}
            img={img}
            fullView={true}
          />
        </View>

        <ScrollView horizontal className="flex-row py-2 rounded-xl mb-1">
          {PRESET_DISCOUNTS.map((percent) => {
            const isSelected = discountsArray.includes(percent);
            return (
              <TouchableOpacity
                key={percent}
                onPress={() => handleDiscountToggle(percent)}
                className={`flex-1 py-2 mx-2 rounded-xl items-center justify-center min-w-[55]
                ${
                  isSelected
                    ? "bg-primary dark:bg-dark-primary"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                style={{ minHeight: 48 }}
              >
                <Text
                  className={`font-semibold text-base 
                  ${
                    isSelected
                      ? "text-white"
                      : "text-foreground dark:text-dark-foreground"
                  }`}
                >
                  {percent}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="p-2 mb-5">
          <CustomTextInput
            placeholder="Descuento (ej: 5+10+2)"
            value={discountPercent}
            onChangeText={handleChangeDiscount}
          />
        </View>

        <View className="gap-y-1 px-2">
          <Row label="Total bruto:" value={totalGross} />
          <Row label="Descuento:" value={-totalDiscount} red />
          <Row label="Subtotal:" value={subtotal} />
          <Row label={`IVA (${IVA*100}%):`} value={iva} />
        </View>

        <View className="h-[1px] bg-gray-300 dark:bg-gray-700 my-3" />

        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-primary dark:text-dark-primary">
            Total
          </Text>
          <Text className="text-lg font-bold text-primary dark:text-dark-primary">
            {totalVenezuela(total)} {currencyDollar}
          </Text>
        </View>
      </View>

      <View className="flex-col mt-6 gap-3">
        <TouchableOpacity
          onPress={handleAddItem}
          className="rounded-2xl bg-primary dark:bg-dark-primary py-4 items-center"
        >
          <Text className="text-white font-bold text-base">
            Agregar al pedido
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onClose(false)}
          className="rounded-2xl bg-gray-300 dark:bg-gray-700 py-4 items-center"
        >
          <Text className="text-black dark:text-white font-bold text-base">
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Row = ({
  label,
  value,
  red,
}: {
  label: string;
  value: number;
  red?: boolean;
}) => (
  <View className="flex-row justify-between">
    <Text className="text-md text-gray-500 dark:text-gray-400">{label}</Text>
    <Text
      className={`text-md ${
        red ? "text-red-500 font-semibold" : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {totalVenezuela(value)} {currencyDollar}
    </Text>
  </View>
);

export default ItemModal;
