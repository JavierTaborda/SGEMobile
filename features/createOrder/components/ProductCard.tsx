import CustomImage from "@/components/ui/CustomImagen";
import { imageURL } from "@/utils/imageURL";
import { currencyDollar, totalVenezuela } from "@/utils/moneyFormat";
import { BlurView } from "expo-blur";

import { safeHaptic } from "@/utils/safeHaptics";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import useCreateOrderStore from "../stores/useCreateOrderStore";
import QuantitySelector from "./QuantitySelector";

type ProductCardProps = {
  codart: string;
  artdes: string;
  price: number;
  available: number;
  almacen?: string;
  setModalItemVisible: (visible: boolean) => void;
};

export default function ProductCard({
  codart,
  artdes,
  price,
  available,
  setModalItemVisible,
}: ProductCardProps) {
  const cartItem = useCreateOrderStore((s) =>
    s.items.find((i) => i.codart === codart)
  );
 
  const removeItem = useCreateOrderStore((s) => s.removeItem);
  const [showMenu, setShowMenu] = useState(false);

  const img = `${imageURL}${codart?.trim()}.jpg`;
  const quantity = cartItem?.quantity ?? 0;

 
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handleLongPress = () => {
    safeHaptic("medium");
    scale.value = withTiming(1.05, { duration: 150 });
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    scale.value = withTiming(1, { duration: 150 });
    setShowMenu(false);
  };
  return (
    <>
      <Pressable
        className="bg-white dark:bg-dark-componentbg rounded-xl p-3 mb-4 w-[48%] shadow shadow-gray-200 dark:shadow-black/20"
        onPress={() => setModalItemVisible(true)}
        onLongPress={handleLongPress}
      >
        <View className="flex-1 items-center justify-center pb-1">
          <View className="h-28 w-2/3 rounded-xl overflow-hidden pb-1 bg-bgimages">
            <CustomImage img={img} />
          </View>
        </View>
        <Text className="text-sm font-semibold text-foreground dark:text-dark-foreground  ">
          {codart}
        </Text>
        <Text
          className="text-xs font-normal text-foreground dark:text-dark-foreground  w-full leading-snug break-words min-h-10"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {artdes}
        </Text>
        <Text className="text-base font-bold text-foreground dark:text-dark-foreground ">
          {totalVenezuela(price)} {currencyDollar}
        </Text>
        
        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 ">
          Disponibles: {available != null ? available - quantity : "—"}
        </Text>
        {quantity > 0 || true ? (
          <QuantitySelector
            codart={codart}
            quantity={quantity}
            available={available}
            artdes={artdes}
            price={price}
            img={img}
            fullView={false}
          />
        ) : null}
      </Pressable>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
     
        <BlurView
          intensity={95}
          tint="dark"
          className="flex-1 justify-center items-center"
        >
         
          <Animated.View
            style={cardStyle}
            className="w-64 p-4 bg-white dark:bg-dark-componentbg rounded-2xl"
          >
            <View className="h-40 w-full rounded-lg mb-3 bg-bgimages">
              <CustomImage img={img} />
            </View>
            <Text className="text-lg font-bold text-foreground dark:text-dark-foreground mb-2">
              {artdes}
            </Text>
            <Text className="text-base font-semibold text-foreground dark:text-dark-foreground mb-4">
              {totalVenezuela(price)} {currencyDollar}
            </Text>

            <TouchableOpacity
              onPress={() => {
                alert("Aplicar descuento");
                handleCloseMenu();
              }}
              className="py-2"
            >
              <Text className="text-primary font-semibold text-center">
                Aplicar descuento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                removeItem(codart);
                handleCloseMenu();
              }}
              className="py-2"
            >
              <Text className="text-red-500 font-semibold text-center">
                Eliminar del carrito
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCloseMenu} className="py-2 mt-2">
              <Text className="text-blue-500 text-center">Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </Modal>
    </>
  );
}
